/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import {
  baseUrl,
  createFetch,
  HttpMethod,
  type Credentials,
  type CursorResponse,
  type DataResponse,
  type ListResponse,
  type Response,
} from "./fetch.js";

// #region TypeScript

type Options = {
  accountId: string;
  namespaceId?: string;
} & Credentials;

type GetNamespacesOptions = {
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

export type NamespaceParams = {
  title: string;
};

type GetKeys = {
  /**
   * The number of keys to return. The cursor attribute may be used to iterate
   * over the next batch of keys if there are more than the limit.
   * @minimum 10
   * @maximum 1000
   * @example 1000
   */
  limit?: number;
  /**
   * Opaque token indicating the position from which to continue when requesting
   * the next set of records if the amount of list results was limited by the
   * limit parameter. A valid value for the cursor can be obtained from the
   * cursors object in the result_info structure.
   * @example "6Ck1la0VxJ0djhidm1MdX2FyDGxLKVeeHZZmORS_8XeSuhz9SjIJRaSa2lnsF01tQOHrfTGAP3R5X1Kv5iVUuMbNKhWNAXHOl6ePB0TUL8nw"
   */
  cursor?: string;
  /**
   * A string prefix used to filter down which keys will be returned. Exact
   * matches and any key names that begin with the prefix will be returned.
   */
  prefix?: string;
};

type Key = {
  name: string;
  expiration: number;
  metadata: Record<string, string | number>;
};

type SetOptions = {
  expiration?: number;
  expiration_ttl?: number;
  json?: false;
};

type GetOptions = {
  json?: false;
};

export type CreateNamespaceResponse = DataResponse<Namespace>;
export type GetKeysResponse = CursorResponse<Key>;

// #endregion

const { GET, PUT, POST, DELETE } = HttpMethod;

/**
 * Cloudflare KV Storage client
 */
export function kv(options: Options) {
  const { accountId, namespaceId, ...credentials } = options;
  const url = `${baseUrl}/accounts/${accountId}/storage/kv/namespaces`;

  return {
    /**
     * List Namespaces
     * @see https://api.cloudflare.com/#workers-kv-namespace-list-namespaces
     */
    getNamespaces: createFetch((params?: GetNamespacesOptions) => ({
      method: GET,
      url,
      searchParams: params,
      credentials,
    })).json<ListResponse<Namespace>>(),

    /**
     * Create a Namespace
     * @see https://api.cloudflare.com/#workers-kv-namespace-properties
     */
    createNamespace: createFetch((title: string) => ({
      method: POST,
      url,
      body: JSON.stringify({ title }),
      credentials,
    })).json<CreateNamespaceResponse>(),

    /**
     * Rename a Namespace
     * @see https://api.cloudflare.com/#workers-kv-namespace-rename-a-namespace
     */
    updateNamespace: createFetch((id: string, title: string) => ({
      method: PUT,
      url: `${url}/${id}`,
      body: JSON.stringify({ title }),
      credentials,
    })).json<Response>(),

    /**
     * Remove a Namespace
     * @see https://api.cloudflare.com/#workers-kv-namespace-remove-a-namespace
     */
    deleteNamespace: createFetch((id: string) => ({
      method: DELETE,
      url: `${url}/${id}`,
      credentials,
    })).json<Response>(),

    /**
     * List a Namespace's Keys
     * @see https://api.cloudflare.com/#workers-kv-namespace-list-a-namespace-s-keys
     */
    getKeys: createFetch((params?: GetKeys) => ({
      method: GET,
      url: `${url}/${namespaceId}/keys`,
      searchParams: { ...params, namespaceId: undefined },
      credentials,
    })).json<GetKeysResponse>(),

    /**
     * Read key-value pair
     * @see https://api.cloudflare.com/#workers-kv-namespace-read-key-value-pair
     */
    get: createFetch((id: string, options?: GetOptions) => ({
      method: GET,
      url: `${url}/${namespaceId}/values/${id}`,
      credentials,
      type: options?.json === false ? "text" : undefined,
      notFoundResponse: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })).json<any>() as <T = any>(
      id: string,
      options?: GetOptions
    ) => Promise<T>,

    /**
     * Write key-value pair
     * @see https://api.cloudflare.com/#workers-kv-namespace-write-key-value-pair
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set: createFetch((id: string, value: any, options?: SetOptions) => ({
      method: PUT,
      url: `${url}/${namespaceId}/values/${id}`,
      searchParams: options,
      body:
        options?.json === false ||
        (typeof options?.json === undefined && typeof value === "string")
          ? value
          : JSON.stringify(value),
      credentials,
    })).json<Response>(),

    /**
     * Delete key-value pair
     * @see https://api.cloudflare.com/#workers-kv-namespace-delete-key-value-pair
     */
    delete: createFetch((id: string) => ({
      method: DELETE,
      url: `${url}/${namespaceId}/values/${id}`,
      credentials,
    })).json<Response>(),
  };
}
