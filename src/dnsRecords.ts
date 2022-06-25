/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { baseUrl, createFetch, HttpMethod, type Credentials } from "./fetch.js";

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
   * Field to order records by
   */
  order?: "type" | "name" | "content" | "ttl" | "proxied";
  /**
   * Page number of paginated results
   * @default 1
   */
  page?: number;
  /**
   * Number of DNS records per page (`min: 5`, `max: 5000`)
   * @default 100
   */
  perPage?: number;
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

// #endregion

/**
 * DNS Records for Zone
 * @see https://api.cloudflare.com/#dns-records-for-a-zone-properties
 */
export function dnsRecords(options: Zone & Credentials) {
  const { zoneId, ...credentials } = options;
  const url = `${baseUrl}/zones/${zoneId}/dns_records`;

  return {
    /**
     * DNS Record Details
     * @see https://api.cloudflare.com/#dns-records-for-a-zone-dns-record-details
     */
    get: createFetch((id: string) => ({
      method: HttpMethod.GET,
      url: `${url}/${id}`,
      credentials,
    })).response<DnsRecord>(),

    /**
     * List DNS Records
     * @see https://api.cloudflare.com/#dns-records-for-a-zone-list-dns-records
     */
    find: createFetch((params?: FindOptions) => ({
      method: HttpMethod.GET,
      url,
      searchParams: {
        match: params?.match,
        name: params?.name,
        order: params?.order,
        page: params?.page,
        per_page: params?.perPage,
        content: params?.content,
        type: params?.type,
        proxied: params?.proxied,
        direction: params?.direction,
      },
      credentials,
    })).query<DnsRecord>(),

    /**
     * Create DNS Record
     * @see https://api.cloudflare.com/#dns-records-for-a-zone-create-dns-record
     */
    create: createFetch((input: DnsRecordInput) => ({
      method: HttpMethod.POST,
      url,
      body: JSON.stringify(input),
      credentials,
    })).response<DnsRecord>(),

    /**
     * Replace DNS Record
     * @see https://api.cloudflare.com/#dns-records-for-a-zone-update-dns-record
     */
    replace: createFetch((id: string, input: DnsRecordInput) => ({
      method: HttpMethod.PUT,
      url: `${url}/${id}`,
      body: JSON.stringify(input),
      credentials,
    })).response<DnsRecord>(),

    /**
     * Update DNS Record
     * @see https://api.cloudflare.com/#dns-records-for-a-zone-patch-dns-record
     */
    update: createFetch((id: string, input: DnsRecordInput) => ({
      method: HttpMethod.PATCH,
      url: `${url}/${id}`,
      body: JSON.stringify(input),
      credentials,
    })).response<DnsRecord>(),

    /**
     * Delete DNS Record
     * @see https://api.cloudflare.com/#dns-records-for-a-zone-delete-dns-record
     */
    delete: createFetch((id: string) => ({
      method: HttpMethod.DELETE,
      url: `${url}/${id}`,
      credentials,
    })).response<{ id: string }>(),
  };
}
