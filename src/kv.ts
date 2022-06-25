/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { baseUrl, createFetch, HttpMethod, type Credentials } from "./fetch.js";

// #region TypeScript

type Options = {
  accountId: string;
} & Credentials;

type FindOptions = {
  /**
   * Page number of paginated results
   * @minimum 1
   * @default 1
   */
  page?: number;
  /**
   * Maximum number of results per page
   * @minimum 5
   * @maximum 100
   * @default 20
   */
  per_page?: number;
  /**
   * Field to order results by
   */
  order?: "id" | "title";
  /**
   * Direction to order namespaces
   */
  direction?: "asc" | "desc";
};

export type Namespace = {
  id: string;
  title: string;
  supports_url_encoding: boolean;
};

export type Key = {
  name: string;
  expiration: number;
  metadata: Record<string, string | number>;
};

type KeysOptions = {
  /**
   * A string prefix used to filter down which keys will be returned. Exact
   * matches and any key names that begin with the prefix will be returned.
   */
  prefix?: string;
  /**
   * The number of keys to return. The cursor attribute may be used to iterate
   * over the next batch of keys if there are more than the limit.
   * @minimum 10
   * @maximum 1000
   * @example 1000
   */
  first?: number;
  /**
   * Opaque token indicating the position from which to continue when requesting
   * the next set of records if the amount of list results was limited by the
   * limit parameter. A valid value for the cursor can be obtained from the
   * cursors object in the result_info structure.
   * @example "6Ck1la0VxJ0djhidm1MdX2FyDGxLKVeeHZZmORS_8XeSuhz9SjIJRaSa2lnsF01tQOHrfTGAP3R5X1Kv5iVUuMbNKhWNAXHOl6ePB0TUL8nw"
   */
  after?: string;
};

type SetOptions = {
  expires?: number;
  expiresTtl?: number;
  /**
   * @default JSON.stringify
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  encode?: ((value: any) => any) | false;
  /**
   * @default "text/plain; charset=utf-8"
   */
  contentType?: string;
};

type GetOptions = {
  /**
   * @default JSON.parse
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decode?: ((value: ArrayBuffer) => any) | false;
};

// #endregion

const { GET, PUT, POST, DELETE } = HttpMethod;

/**
 * Cloudflare KV Storage client
 */
export function kv(options: Options) {
  const { accountId, ...credentials } = options;
  const url = `${baseUrl}/accounts/${accountId}/storage/kv/namespaces`;

  if (!accountId) throw new TypeError(`options.accountId`);

  if ("accessToken" in credentials) {
    if (!credentials.accessToken) throw new TypeError(`options.accessToken`);
  } else {
    if (!credentials.authKey) throw new TypeError(`options.authKey`);
    if (!credentials.authEmail) throw new TypeError(`options.authEmail`);
  }

  return {
    /**
     * List Namespaces
     * @see https://api.cloudflare.com/#workers-kv-namespace-list-namespaces
     */
    find: createFetch((params?: FindOptions) => ({
      method: GET,
      url,
      searchParams: params,
      credentials,
    })).query<Namespace>(),

    /**
     * Create a Namespace
     * @see https://api.cloudflare.com/#workers-kv-namespace-properties
     */
    create: createFetch((name: string) => ({
      method: POST,
      url,
      body: JSON.stringify({ title: name }),
      credentials,
    })).response<Namespace>(),

    /**
     * Rename a Namespace
     * @see https://api.cloudflare.com/#workers-kv-namespace-rename-a-namespace
     */
    update: createFetch((id: string, title: string) => ({
      method: PUT,
      url: `${url}/${id}`,
      body: JSON.stringify({ title }),
      credentials,
    })).response<null>(),

    /**
     * Remove a Namespace
     * @see https://api.cloudflare.com/#workers-kv-namespace-remove-a-namespace
     */
    delete: createFetch((id: string) => ({
      method: DELETE,
      url: `${url}/${id}`,
      credentials,
    })).response<null>(),

    namespace(id: string) {
      const namespaceUrl = `${url}/${id}`;
      const namespaceId = id;

      return {
        keys: createFetch((params?: KeysOptions) => ({
          method: GET,
          url: `${namespaceUrl}/keys`,
          searchParams: {
            prefix: params?.prefix,
            limit: params?.first,
            cursor: params?.after,
          },
          credentials,
        })).query<Key>(),

        /**
         * Read key-value pair
         * @see https://api.cloudflare.com/#workers-kv-namespace-read-key-value-pair
         */
        get: createFetch((key: string, options?: GetOptions) => ({
          method: GET,
          url: `${url}/${namespaceId}/values/${key}`,
          credentials,
          type:
            options?.decode === false
              ? "text"
              : options?.decode
              ? "binary"
              : "json",
          notFoundResponse: undefined,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        })).response<any>() as <T = any>(
          key: string,
          options?: GetOptions
        ) => Promise<T>,

        /**
         * Write key-value pair
         * @see https://api.cloudflare.com/#workers-kv-namespace-write-key-value-pair
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set: createFetch((key: string, value: any, options?: SetOptions) => ({
          method: PUT,
          url: `${namespaceUrl}/values/${key}`,
          searchParams: {
            expiration: options?.expires,
            expiration_ttl: options?.expiresTtl,
          },
          body:
            options?.encode === false ||
            (typeof options?.encode === undefined && typeof value === "string")
              ? value
              : JSON.stringify(value),
          contentType: options?.contentType ?? "text/plain; charset=utf-8",
          credentials,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        })).response<undefined>() as <T = any>(
          key: string,
          value: T,
          options?: SetOptions
        ) => Promise<undefined>,

        delete: createFetch((id: string) => ({
          method: DELETE,
          url: `${url}/${namespaceId}/values/${id}`,
          credentials,
        })).response<void>(),
      };
    },
  };
}
