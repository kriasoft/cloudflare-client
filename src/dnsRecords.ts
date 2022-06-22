/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import {
  baseUrl,
  createFetch,
  type Credentials,
  type ListRes,
  type Res,
} from "./fetch.js";

// #region TypeScript

export type Zone = {
  /**
   * DNS zone identity
   */
  zoneId: string;
};

export type DnsRecordType =
  | "A"
  | "AAAA"
  | "CNAME"
  | "HTTPS"
  | "TXT"
  | "SRV"
  | "LOC"
  | "MX"
  | "NS"
  | "CERT"
  | "DNSKEY"
  | "DS"
  | "NAPTR"
  | "SMIMEA"
  | "SSHFP"
  | "SVCB"
  | "TLSA"
  | "URI";

type FindOptions = {
  /**
   * Whether to match all search requirements or at least one (`any`)
   * @default "all"
   */
  match?: "all" | "any";
  /**
   * DNS record name (`max length: 255`)
   * @example "example.com"
   */
  name?: string;
  /**
   * Page number of paginated results
   * @default 1
   */
  page?: number;
  /**
   * Number of DNS records per page (`min: 5`, `max: 5000`)
   * @default 100
   */
  per_page?: number;
  /**
   * DNS record content
   * @example "127.0.0.1"
   */
  content?: string;
  /**
   * DNS record type
   * @example "A"
   */
  type?: DnsRecordType;
  /**
   * DNS record proxied status
   */
  proxied?: boolean;
  /**
   * Direction to order domains
   */
  direction?: "asc" | "desc";
};

type DnsRecordInput = {
  /**
   * DNS record type
   * @example "A"
   */
  type: DnsRecordType;
  /**
   * DNS record name (`max length: 255`)
   * @example "example.com"
   */
  name: string;
  /**
   * DNS record content
   * @example "127.0.0.1"
   */
  content: string;
  /**
   * Time to live, in seconds, of the DNS record.
   * Must be between `60` and `86400`, or `1` for `automatic`.
   * @example 3600
   */
  ttl: number;
  /**
   * Required for MX, SRV and URI records; unused by other record types.
   * Records with lower priorities are preferred.
   * @example: 10
   */
  priority?: number;
  /**
   * Whether the record is receiving the performance and security benefits of Cloudflare
   */
  proxied?: boolean;
};

export type DnsRecord = {
  /**
   * DNS record identifier
   */
  id: string;
  /**
   * DNS record type
   */
  type: DnsRecordType;
  /**
   * DNS record name
   * @example "example.com"
   */
  name: string;
  /**
   * DNS record content
   * @example "127.0.0.1"
   */
  content: string;
  proxiable: boolean;
  /**
   * Whether the record is receiving the performance and security benefits of Cloudflare
   */
  proxied: boolean;
  /**
   * Time to live, in seconds, of the DNS record.
   */
  ttl: number;
  locked: boolean;
  zone_id: string;
  zone_name: string;
  created_on: string;
  modified_on: string;
  meta: {
    auto_added: boolean;
    managed_by_apps: boolean;
    managed_by_argo_tunnel: boolean;
    source: "primary" | string;
  };
  data?: Record<string, unknown>;
};

export type DnsRecordResponse = Res<DnsRecord>;
export type DnsRecordsResponse = ListRes<DnsRecord>;
export type DeleteDnsRecordResponse = {
  result: {
    id: string;
  } | null;
};

// #endregion

export function dnsRecords(options: Zone & Credentials) {
  const { zoneId, ...credentials } = options;
  const url = `${baseUrl}/zones/${zoneId}/dns_records`;

  return {
    /**
     * DNS Record Details
     * @see https://api.cloudflare.com/#dns-records-for-a-zone-dns-record-details
     */
    get: createFetch<string, DnsRecordResponse>({
      method: "GET",
      url: (id) => `${url}/${id}`,
      credentials,
    }) as (id: string) => Promise<DnsRecordResponse>,

    /**
     * Find DNS Record
     * @see https://api.cloudflare.com/#dns-records-for-a-zone-list-dns-records
     */
    find: createFetch<FindOptions, DnsRecordResponse>({
      method: "GET",
      url,
      credentials,
      single: true,
    }) as (params?: FindOptions) => Promise<DnsRecordResponse>,

    /**
     * List DNS Records
     * @see https://api.cloudflare.com/#dns-records-for-a-zone-list-dns-records
     */
    findMany: createFetch<FindOptions, DnsRecordsResponse>({
      method: "GET",
      url,
      credentials,
    }) as (params?: FindOptions) => Promise<DnsRecordsResponse>,

    /**
     * Create DNS Record
     * @see https://api.cloudflare.com/#dns-records-for-a-zone-create-dns-record
     */
    create: createFetch<DnsRecordInput, DnsRecordResponse>({
      method: "POST",
      url,
      credentials,
    }),

    /**
     * Update DNS Record
     * @see https://api.cloudflare.com/#dns-records-for-a-zone-update-dns-record
     */
    update: createFetch<DnsRecordInput & { id: string }, DnsRecordResponse>({
      method: "PUT",
      url,
      credentials,
    }),

    /**
     * Patch DNS Record
     * @see https://api.cloudflare.com/#dns-records-for-a-zone-patch-dns-record
     */
    patch: createFetch<
      Partial<DnsRecordInput> & { id: string },
      DnsRecordResponse
    >({
      method: "PATCH",
      url,
      credentials,
    }),

    /**
     * Delete DNS Record
     * @see https://api.cloudflare.com/#dns-records-for-a-zone-delete-dns-record
     */
    delete: createFetch<string, DeleteDnsRecordResponse>({
      method: "DELETE",
      url: (id) => `${url}/${id}`,
      credentials,
    }) as (id: string) => Promise<DeleteDnsRecordResponse>,
  };
}
