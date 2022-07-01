/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { type Zone } from "./dnsRecords.js";
import { baseUrl, createFetch, HttpMethod, type Credentials } from "./fetch.js";

// #region TypeScript

type FindOptions = {
  /**
   * Fully qualified domain name to match against. This parameter cannot be used
   * with the `id` parameter.
   * @example "app.example.com"
   */
  hostname?: string;
  /**
   * Hostname ID to match against. This ID was generated and returned during the
   * initial custom_hostname creation. This parameter cannot be used with the
   * `hostname` parameter.
   * @example "0d89c70d-ad9f-4843-b99f-6cc0252067e9"
   */
  id?: string;
  /**
   * Whether to filter hostnames based on if they have SSL enabled
   * @example "example.com"
   */
  ssl?: 0 | 1;
  /**
   * Page number of paginated results (`min: 1`)
   * @default 1
   */
  page?: number;
  /**
   * Number of hostnames per page (`min: 5`, `max: 50`)
   * @default 20
   */
  perPage?: number;
  /**
   * Field to order hostnames by
   * @default "ssl"
   */
  order?: "ssl" | "ssl_status";
  /**
   * Direction to order hostnames
   * @example "desc"
   */
  direction?: "asc" | "desc";
};

export type CustomHostname = {
  /**
   * Custom hostname identifier tag (`min length: 36`, `max length: 36`)
   * @example "0d89c70d-ad9f-4843-b99f-6cc0252067e9"
   */
  id: string;
  /**
   * Custom hostname that points to zone's hostname via CNAME (`max length: 255`)
   * @example "@app.example.com"
   */
  hostname: string;
  /**
   * SSL properties for the custom hostname
   */
  ssl: {
    /**
     * Custom hostname SSL identifier tag (`min length: 36`, `max length: 36`)
     * @example "0d89c70d-ad9f-4843-b99f-6cc0252067e9"
     */
    id: string;
    /**
     * Status of the hostname's SSL certificates
     */
    status:
      | "initializing"
      | "pending_validation"
      | "pending_issuance"
      | "pending_deployment"
      | "active"
      | "pending_deletion"
      | "deleted";
    /**
     * Domain control validation (DCV) method used for this hostname.
     */
    method: "http" | "txt" | "email";
    /**
     * Level of validation to be used for this hostname. Domain validation (dv) must be used.
     */
    type: "dv";
    validation_records: Array<{
      txt_name: string;
      txt_value: string;
      http_url: string;
      http_body: string;
      emails: string[];
    }>;
    validation_errors: Array<{ message: string }>;
    hosts: string[];
    issuer: string;
    serial_number: string;
    signature: string;
    uploaded_on: string;
    expires_on: string;
    custom_csr_id: string;
    settings: Record<string, unknown>;
    bundle_method: "ubiquitous" | "optimal" | "force";
    wildcard: boolean;
    certificate_authority: "digicert" | "lets_encrypt";
    custom_certificate: string;
    custom_key: string;
  } | null;
  /**
   * These are per-hostname (customer) settings.
   */
  custom_metadata?: Record<string, unknown>;
  /**
   * A valid hostname that’s been added to your DNS zone as an A, AAAA,
   * or CNAME record.
   * @example "origin2.example.com"
   */
  custom_origin_server?: string;
  /**
   * A hostname that will be sent to your custom origin server as SNI for TLS
   * handshake. This can be a valid subdomain of the zone or custom origin
   * server name or the string ':request_host_header:' which will cause the host
   * header in the request to be used as SNI. Not configurable with
   * default/fallback origin server.
   * @example "sni.example.com"
   */
  custom_origin_sni?: string;
  /**
   * Status of the hostname's activation.
   */
  status: "pending" | "active" | "moved" | "deleted";
  /**
   * These are errors that were encountered while trying to activate a hostname.
   */
  verification_errors: string[];
  /**
   * This is a record which can be placed to activate a hostname.
   */
  ownership_verification: {
    /**
     * DNS Record type
     */
    type: "txt";
    /**
     * DNS Name for record.
     * @example "_cf-custom-hostname.app.example.com"
     */
    name: string;
    /**
     * Content for the record.
     * @example "5cc07c04-ea62-4a5a-95f0-419334a875a4"
     */
    value: string;
  };
  /**
   * This presents the token to be served by the given http url to activate a hostname.
   */
  ownership_verification_http: {
    /**
     * The HTTP URL that will be checked during custom hostname verification and where the customer should host the token.
     * @example "http://custom.test.com/.well-known/cf-custom-hostname-challenge/0d89c70d-ad9f-4843-b99f-6cc0252067e9"
     */
    http_url: string;
    /**
     * Token to be served.
     * @example "5cc07c04-ea62-4a5a-95f0-419334a875a4"
     */
    http_body: string;
  };
  /**
   * This is the time the hostname was created.
   * @example "2020-02-06T18:11:23.531995+00:00"
   */
  created_at: string;
};

/**
 * SSL properties for the custom hostname
 */
type SSL = {
  /**
   * Domain control validation (DCV) method used for this hostname.
   */
  method?: "http" | "txt" | "email";
  /**
   * Level of validation to be used for this hostname. Domain validation (dv) must be used.
   */
  type?: "dv";
  /**
   * SSL specific settings
   */
  settings?: {
    /**
     * Whether or not HTTP2 is enabled.
     */
    http2?: boolean;
    /**
     * The minimum TLS version supported.
     */
    min_tls_version?: "1.0" | "1.1" | "1.2" | "1.3";
    /**
     * Whether or not TLS 1.3 is enabled.
     */
    tls_1_3?: boolean;
    /**
     * An allowlist of ciphers for TLS termination. These ciphers must be in
     * the BoringSSL format.
     * @example
     *   [
     *     "ECDHE-RSA-AES128-GCM-SHA256",
     *     "AES128-SHA"
     *   ]
     */
    ciphers?: string[];
    /**
     * Whether or not Early Hints is enabled.
     */
    early_hints?: boolean;
  };
  /**
   * A ubiquitous bundle has the highest probability of being verified
   * everywhere, even by clients using outdated or unusual trust stores.
   * An optimal bundle uses the shortest chain and newest intermediates.
   * And the force bundle verifies the chain, but does not otherwise modify it.
   */
  bundle_method?: "ubiquitous" | "optimal" | "force";
  /**
   * Indicates whether the certificate covers a wildcard.
   */
  wildcard?: boolean;
  /**
   * If a custom uploaded certificate is used
   */
  custom_certificate?: string;
  /**
   * The key for a custom uploaded certificate
   */
  custom_key?: string;
};

type CreateParams = {
  /**
   * The custom hostname that will point to your hostname via CNAME (`max length: 255`).
   * @example "app.example.com"
   */
  hostname: string;
  /**
   * SSL properties for the custom hostname
   */
  ssl?: SSL;
};

type UpdateParams = {
  /**
   * SSL properties for the custom hostname
   */
  ssl?: SSL;
  /**
   * These are per-hostname (customer) settings.
   * @example
   *   {
   *     "key": "value"
   *   }
   */
  custom_metadata?: Record<string, unknown>;
  /**
   * A valid hostname that’s been added to your DNS zone as an A, AAAA,
   * or CNAME record.
   * @example "origin2.example.com"
   */
  custom_origin_server?: string;
  /**
   * A hostname that will be sent to your custom origin server as SNI for TLS
   * handshake. This can be a valid subdomain of the zone or custom origin
   * server name or the string `:request_host_header:` which will cause the host
   * header in the request to be used as SNI. Not configurable with
   * default/fallback origin server.
   */
  custom_origin_sni?: string;
};

// #endregion

/**
 * Custom Hostname for a Zone
 * @see https://api.cloudflare.com/#custom-hostname-for-a-zone-properties
 */
export function customHostnames(options: Zone & Credentials) {
  const { zoneId, ...credentials } = options;
  const url = `${baseUrl}/zones/${zoneId}/custom_hostnames`;

  return {
    /**
     * Custom Hostname Details
     * @see https://api.cloudflare.com/#custom-hostname-for-a-zone-custom-hostname-details
     */
    get: createFetch((id: string) => ({
      method: HttpMethod.GET,
      url: `${url}/${id}`,
      credentials,
    })).response<CustomHostname>(),

    /**
     * List Custom Hostnames
     * @see https://api.cloudflare.com/#custom-hostname-for-a-zone-list-custom-hostnames
     */
    find: createFetch((params?: FindOptions) => ({
      method: HttpMethod.GET,
      url,
      searchParams: {
        hostname: params?.hostname,
        id: params?.id,
        ssl: params?.ssl,
        page: params?.page,
        per_page: params?.perPage,
        order: params?.order,
        direction: params?.direction,
      },
      credentials,
    })).query<CustomHostname>(),

    /**
     * Create Custom Hostname
     * @see https://api.cloudflare.com/#custom-hostname-for-a-zone-create-custom-hostname
     */
    create: createFetch((params: CreateParams) => ({
      method: HttpMethod.POST,
      url,
      body: JSON.stringify(params),
      credentials,
    })).response<CustomHostname>(),

    /**
     * Edit Custom Hostname
     * @see https://api.cloudflare.com/#custom-hostname-for-a-zone-edit-custom-hostname
     */
    update: createFetch((id: string, params: UpdateParams) => ({
      method: HttpMethod.PATCH,
      url: `${url}/${id}`,
      body: JSON.stringify(params),
      credentials,
    })).response<CustomHostname>(),

    /**
     * Delete Custom Hostname (and any issued SSL certificates)
     * @see https://api.cloudflare.com/#custom-hostname-for-a-zone-delete-custom-hostname-and-any-issued-ssl-certificates-
     */
    delete: createFetch((id: string) => ({
      method: HttpMethod.DELETE,
      url: `${url}/${id}`,
      credentials,
    })).response<{ id: string; ssl: SSL | null; created_at: string }>(),
  };
}
