<script>
  import { onMount } from "svelte";
  import { client, gql } from "../graphql.js";
  import { safeJsonParse } from "../utils/safeJsonParse.js";

  onMount(() => {
    queryError();
  });

  const HANDLE_ERRORS_QUERY = gql`
    query HANDLE_ERRORS_QUERY {
      queryError
    }
  `;

  async function queryError() {
    const [data, error] = await client.query(HANDLE_ERRORS_QUERY);

    if (error) {
      errorStore(error);
      return;
    }

    console.log(data);
  }

  // This should be the error store set errors function
  function errorStore(error) {
    console.error(error.name);
    let [json] = safeJsonParse(error.message);
    if (json.constructor === String) {
      json = {
        minusqlCatchBlockError: json,
      };
    }
    if (json.constructor === Object) {
      for (const val of Object.values(json)) {
        console.error(val);
      }
    } else {
      console.error(error);
    }
  }
</script>
