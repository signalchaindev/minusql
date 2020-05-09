(function (exports) {
  'use strict';

  /**
   * @param {String} Any
   *
   * @return {Array}
   * if param string is valid JSON, safeJsonParse returns the parsed JSON as the 0th index and null as the 1st index
   * if param string is *not* valid JSON, safeJsonParse returns the original string as the 0th index and the classic JSON parse error as the 1st index
   */
  function safeJsonParse(str) {
    try {
      return [JSON.parse(str), null]
    } catch (err) {
      return [str, err]
    }
  }

  const isEmpty = value =>
    value === undefined ||
    value === null ||
    (value.constructor === Array && value.length === 0) ||
    (value.constructor === Object && Object.keys(value).length === 0) ||
    (value.constructor === String && value.trim().length === 0);

  /**
   * The cache
   */
  const cacheStore = new Map();

  /**
   * Create a MinusQL instance
   *
   * @param {Object!} options
   * @param {String!} options.uri - the server address of the GraphQL endpoint
   * @param {Object} options.headers - request headers
   * @param {Object} options.requestOptions - addition options to fetch request(refer to fetch api)
   * @param {Boolean} options.verbose - log errors to console
   *
   * @return {Object} GraphQL client
   */
  function MinusQL({ uri, credentials, headers, requestOptions, verbose }) {
    this.uri = uri;

    this.requestObject = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
      credentials: credentials || 'include',
    };

    if (!isEmpty(requestOptions)) {
      this.requestObject.requestOptions = requestOptions;
    }

    if (verbose) {
      this.verbose = verbose;
    }
  }

  /**
   * Query method
   *
   * @param {Object!} options
   * @param {String!} options.query
   * @param {Object} options.variables
   * @param {Object} options.requestOptions - addition options to fetch request(refer to fetch api)
   *
   * @return {Object} { data, error }
   */
  MinusQL.prototype.query = function query({
    query,
    variables,
    requestOptions,
    ...rest
  }) {
    const hasOperation = !!query;
    validateResolver('query', hasOperation, rest);
    const options = aggregateOptions(query, variables, requestOptions);
    return this.fetchHandler(options)
  };

  /**
   * Mutation method
   *
   * @param {Object!} options
   * @param {String!} options.mutation
   * @param {Object} options.variables
   * @param {String} options.refetchQuery
   * @param {Object} options.requestOptions - addition options to fetch request(refer to fetch api)
   *
   * @return {Object} { data, error }
   */
  MinusQL.prototype.mutation = function mutation({
    mutation,
    variables,
    refetchQuery = null,
    requestOptions,
    ...rest
  }) {
    validateResolver(rest);
    const hasOperation = !!mutation;
    validateResolver('mutation', hasOperation, rest);
    const options = aggregateOptions(
      mutation,
      variables,
      requestOptions,
      refetchQuery,
    );
    return this.fetchHandler(options)
  };

  MinusQL.prototype.cache = function cache({
    operation,
    operationName,
    variables,
    refetchQuery,
    requestOptions,
    data,
    updateItem,
    deleteItem,
  }) {
    let cacheKey;

    if (operation && !updateItem && !deleteItem) {
      cacheKey = JSON.stringify({
        query: refetchQuery ? refetchQuery.query : operationName,
        variables: refetchQuery ? refetchQuery.variables : variables,
      });
    }

    // Client side cache works as expected
    // Server side cache works, but doesn't self isolate in regards to multiple users session data (test by opening different browsers, with different users logged in separately)

    const options = {
      operation,
      variables,
      requestOptions,
    };

    if (!refetchQuery && data) {
      cacheStore.set(cacheKey, { ...data, options });
      // console.log('\nSET CACHE:', cache, '\n')
      return
    }

    if (cacheKey && !refetchQuery && !updateItem && !deleteItem) {
      const value = cacheStore.get(cacheKey);
      // console.log('\nGET CACHED ITEM:', cache, '\n')
      return value
    }

    if (refetchQuery) {
      // USAGE: Sign out user is a bad example. That's more of an update or delete cache key situation, but this is the syntax.

      // await client.mutation({
      //   mutation: SIGN_OUT_USER_MUTATION,
      //   refetchQuery: {
      //     query: 'CURRENT_USER_QUERY',
      //     variables: {
      //       authToken: user.authToken,
      //     },
      //   },
      // })
      const refetchKey = JSON.stringify(refetchQuery);

      const { options } = cacheStore.get(refetchKey);
      cacheStore.delete(refetchKey);

      // Get the informations off the cache value to refetch the query
      this.fetchHandler(options);
      // console.log('\nREFETCH QUERY:', cache, '\n')
      return
    }

    if (updateItem) {
      const { data, ...keyData } = updateItem;
      const updateKey = JSON.stringify(keyData);
      const currentVal = cacheStore.get(updateKey);
      const options = currentVal && currentVal.options;

      cacheStore.set(updateKey, { data, options });

      // console.log('\nUPDATE CACHE:', cache, '\n')
      return cacheStore
    }

    if (deleteItem) {
      const key = JSON.stringify(deleteItem);
      const has = cacheStore.has(key);

      if (has) {
        cacheStore.delete(key);
      }

      // console.log('\nUPDATE CACHE:', cache, '\n')
      return cacheStore
    }

    if (cacheStore.size > 0) {
      // console.log('\nRETURN CACHE:', cache, '\n')
      return cacheStore
    }
  };

  /**
   * Fetch handler
   *
   * @param {Object!} options
   * @param {String!} options.operation
   * @param {Object} options.variables
   * @param {Object} options.refetchQuery
   * @param {Object} options.requestOptions - addition options to fetch request(refer to fetch api)
   *
   * @return {Object} { data, error }
   */
  MinusQL.prototype.fetchHandler = async function fetchHandler({
    operation,
    variables,
    refetchQuery = null,
    requestOptions,
  }) {
    const [operationType, name] = operation.split(' ');
    const [operationName] = name.split('(');

    const isQuery = operationType === 'query';
    const isMutation = operationType === 'mutation';

    if (isMutation && refetchQuery) {
      await this.cache({ refetchQuery });
    }

    if (isQuery) {
      const cacheData = await this.cache({
        operation,
        operationName,
        variables,
        requestOptions,
      });

      // If there is data in the cache, return it
      if (cacheData) {
        return { ...cacheData, error: null }
      }
    }

    const body = {
      operationName,
      query: operation,
      variables,
    };

    const options = {
      ...this.requestObject,
      ...requestOptions,
      body: JSON.stringify(body),
    };

    let resErrors = {};

    // console.log("-----------I'M FETCHING!-----------")
    const res = await fetch(this.uri, options).catch(err => {
      this.verbose && console.error(err);

      resErrors = {
        message: err,
        stack: null,
        details: null,
      };
    });

    if (!res) {
      return {
        data: null,
        error: { message: 'Request failed' },
      }
    }

    const data = await res.json().catch(err => {
      this.verbose && console.error(err);

      resErrors = {
        message: err,
        stack: null,
        details: null,
      };
    });

    if (!data) {
      return {
        data: null,
        error: { message: resErrors.message },
      }
    }

    /**
     * message {String}
     * stack {Object}
     * details {Array}
     */
    resErrors = {
      message: res.statusText,
      stack: res,
      details: data && data.errors,
    };

    // if data in response is 'null'
    if (!data) {
      resErrors.details = [
        ...resErrors.details,
        { message: `Bad Response: ${data || null}` },
      ];
    }

    // if all properties of data are 'null'
    const allDataKeyEmpty = Object.keys(data).every(key => !data[key]);
    if (allDataKeyEmpty) {
      resErrors.details = [
        ...resErrors.details,
        { message: `Bad Response: ${data || null}` },
      ];
    }

    // If the Request fails, short circuit
    if (!res.ok || (data && data.errors && data.errors.length !== 0)) {
      const clientErrors = {};
      this.verbose && console.error('Error:', resErrors);

      for (const err of data.errors) {
        const [result] = safeJsonParse(err.message);

        if (typeof result === 'string') {
          if (result === '[object Object]') {
            this.verbose &&
              console.error('Error: thrown errors must be of type string');
          }
          this.verbose && console.error(`Error: ${result}`);

          clientErrors.message = result;
        } else {
          for (const [key, val] of Object.entries(result)) {
            this.verbose && console.error(`Error: "${key}: ${val}"`);

            clientErrors[key] = val;
          }
        }
      }

      return {
        data: null,
        error: Object.keys(clientErrors).length > 0 ? clientErrors : null,
      }
    }

    // Set data in cache
    if (isQuery) {
      await this.cache({ operation, variables, data });
    }

    return { ...data.data, error: res.ok && null }
  };

  function validateResolver(operationType, hasOperation = true, rest = {}) {
    if (!hasOperation) {
      this.verbose &&
        console.error(
          `${operationType} method requires an object argument with a '${operationType}' property`,
        );
    }

    if (Object.keys(rest).length !== 0) {
      for (const key of Object.keys(rest)) {
        this.verbose && console.error(`Error: ${key} is not a valid option`);
      }
    }
  }

  function aggregateOptions(resolver, variables, requestOptions, refetchQuery) {
    const options = {
      operation: resolver,
      variables,
    };

    if (!isEmpty(requestOptions)) {
      options.requestOptions = requestOptions;
    }

    if (!isEmpty(refetchQuery)) {
      options.refetchQuery = refetchQuery;
    }

    return options
  }

  function gql(strings, ...pieces) {
    return String.raw({ raw: normalizeStr(strings[0]) }, ...pieces)
  }

  function normalizeStr(string) {
    return string.replace(/[\s,]+/g, ' ').trim()
  }

  exports.MinusQL = MinusQL;
  exports.gql = gql;

  return exports;

}({}));
