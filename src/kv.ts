/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import {
  baseUrl,
  createFetch,
  type Credentials,
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
   * Page number of paginated results (`min value: 1`)
   * @default 1
   */
  page?: number;
  /**
   * Maximum number of results per page (`min value: 5`, `max value: 100`)
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

type CreateNamespaceOptions = {
  title: string;
};

export type Namespace = {
  id: string;
  title: string;
  supports_url_encoding: boolean;
};

export type CreateNamespaceResponse = DataResponse<Namespace>;

// #endregion

export function kv(options: Options) {
  const { accountId, namespaceId, ...credentials } = options;
  const url = `${baseUrl}/accounts/${accountId}/storage/kv/namespaces`;

  return {
    /**
     * List Namespaces
     * @see https://api.cloudflare.com/#workers-kv-namespace-list-namespaces
     */
    getNamespaces: createFetch<GetNamespacesOptions, ListResponse<Namespace>>({
      method: "GET",
      url,
      credentials,
    }) as (params?: GetNamespacesOptions) => Promise<ListResponse<Namespace>>,

    /**
     * Create a Namespace
     * @see https://api.cloudflare.com/#workers-kv-namespace-properties
     */
    createNamespace: createFetch<
      CreateNamespaceOptions,
      CreateNamespaceResponse
    >({
      method: "POST",
      url,
      credentials,
    }),

    /**
     * Remove a Namespace
     * @see https://api.cloudflare.com/#workers-kv-namespace-remove-a-namespace
     */
    deleteNamespace: createFetch<string, Response>({
      method: "DELETE",
      url: (id) => `${url}/${id}`,
      credentials,
    }) as (id: string) => Promise<Response>,
  };
}
