declare type RequestMethod = "POST";
interface RequestHeaders {
    Accept: "application/json";
    "Content-Type": "application/json";
    [index: string]: any;
}
declare type RequestMode = "cors" | "navigate" | "no-cors" | "same-origin";
declare type RequestCredentials = "include" | "omit" | "same-origin";
declare type RequestCache = "default" | "force-cache" | "no-cache" | "no-store" | "only-if-cached" | "reload";
interface RequestObject {
    method: RequestMethod;
    headers: RequestHeaders;
    body: string;
    mode: RequestMode;
    credentials: RequestCredentials;
    cache: RequestCache;
    [key: string]: any;
}

declare type FetchPolicy = "cache" | "no-cache";
interface MinusQLInput {
    uri: string;
    fetchPolicy?: FetchPolicy;
    credentials?: string;
    headers?: RequestHeaders;
    requestOptions?: Object;
}
/**
 * Create a MinusQL instance
 */
declare function MinusQL(this: MinusQLInput, { uri, fetchPolicy, credentials, headers, requestOptions }: MinusQLInput): void;

declare function gql(strings: any, ...rest: any[]): string;

interface GenCacheKeyInput {
    operationName: string;
    variables?: Object;
}
declare function generateCacheKey({ operationName, variables, }: GenCacheKeyInput): string;

declare function isEmpty(value: undefined | null | string | number | Array<any> | Object): boolean;

declare const isoFetch: ((url: string, opts: RequestObject) => Promise<any>) | (((input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>) & typeof fetch);

declare type ParseGQLStringReturn = [string, string];
declare function parseGQLString(operation: string): ParseGQLStringReturn;

/**
 * @param {string}
 * @returns {void}
 */
declare function rimraf(entry_path: any): void;

export { MinusQL, RequestCache, RequestCredentials, RequestHeaders, RequestMethod, RequestMode, RequestObject, generateCacheKey, gql, isEmpty, isoFetch, parseGQLString, rimraf };
//# sourceMappingURL=types.d.ts.map
