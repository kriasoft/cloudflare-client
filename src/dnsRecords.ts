/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { baseUrl, createFetch, type ListRes, type Res } from "./fetch.js";

// #region TypeScript

type Options = {
  zoneId: string;
  accessToken: string;
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
   * @example "192.0.2.1"
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

export type DnsRecord = {
  id: string;
  type: DnsRecordType;
  name: string;
  content: string;
  proxiable: boolean;
  proxied: boolean;
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
export type DnsRecordsOptions = Options;

// #endregion

export function dnsRecords(options: Options) {
  const url = `${baseUrl}/zones/${options.zoneId}/dns_records`;

  return {
    /**
     * DNS Record Details
     * @see https://api.cloudflare.com/#dns-records-for-a-zone-dns-record-details
     */
    get: createFetch<string, DnsRecordResponse>({
      method: "GET",
      url: (id) => `${url}/${id}`,
      accessToken: options.accessToken,
    }) as (id: string) => Promise<DnsRecordResponse>,

    /**
     * Find DNS Record
     * @see https://api.cloudflare.com/#dns-records-for-a-zone-list-dns-records
     */
    find: createFetch<FindOptions, DnsRecordResponse>({
      method: "GET",
      url,
      accessToken: options.accessToken,
      single: true,
    }),

    /**
     * List DNS Records
     * @see https://api.cloudflare.com/#dns-records-for-a-zone-list-dns-records
     */
    findMany: createFetch<FindOptions, DnsRecordsResponse>({
      method: "GET",
      url,
      accessToken: options.accessToken,
    }),

    create: createFetch({
      method: "POST",
      url,
      accessToken: options.accessToken,
    }),

    update: createFetch({
      method: "PATCH",
      url,
      accessToken: options.accessToken,
    }),

    delete: createFetch({
      method: "DELETE",
      url,
      accessToken: options.accessToken,
    }),
  };
}
