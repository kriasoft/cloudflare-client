/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { baseUrl, createFetch, HttpMethod, type Credentials } from "./fetch.js";

// #region TypeScript

export type Token = {
  /**
   * Token identifier tag
   * @maximum 32
   */
  readonly id: string;
  /**
   * Token name
   * @maximum 120
   */
  readonly name: string;
  /**
   * Status of the token
   */
  readonly status: "active" | "disabled" | "expired";
  /**
   * The time on which the token was created
   * @example "2018-07-01T05:20:00+00:00"
   */
  readonly issued_on: string;
  /**
   * @example "2018-07-01T05:20:00+00:00"
   */
  readonly last_used_on: string;
  /**
   * Last time the token was modified
   * @example "2018-07-02T05:20:00+00:00"
   */
  readonly modified_on: string;
  /**
   * The time before which the token MUST NOT be accepted for processing
   * @example "2018-07-01T05:20:00+00:00"
   */
  readonly not_before: string;
  /**
   * The expiration time on or after which the JWT MUST NOT be accepted for processing
   * @example "2020-01-01T00:00:00+00:00"
   */
  readonly expires_on: string;
  /**
   * List of access policies assigned to the token
   */
  readonly policies: TokenPolicy[];
  readonly condition: TokenCondition;
};

export type TokenPolicy = {
  /**
   * Policy identifier
   * @example "f267e341f3dd4697bd3b9f71dd96247f"
   */
  readonly id: string;
  /**
   * Allow or deny operations against the resources
   */
  readonly effect: "allow" | "deny";
  /**
   * A list of resource names that the policy applies to
   * @example
   *   {
   *     "com.cloudflare.api.account.zone.eb78d65290b24279ba6f44721b3ea3c4": "*",
   *     "com.cloudflare.api.account.zone.22b1de5f1c0e4b3ea97bb1e963b06a43": "*"
   *   }
   */
  readonly resources: string[];
  /**
   * A set of permission groups that are specified to the policy
   * @example
   *   [
   *     {
   *       "id": "c8fed203ed3043cba015a93ad1616f1f",
   *       "name": "Zone Read"
   *     },
   *     {
   *       "id": "82e64a83756745bbbb1c9c2701bf816b",
   *       "name": "DNS Read"
   *     }
   *   ]
   */
  readonly permission_groups: {
    /**
     * Identifier of the group
     * @example "6d7f2f5f5b1d4a0e9081fdc98d432fd1"
     */
    readonly id: string;
    /**
     * Name of the group
     * @example "Load Balancers Write"
     */
    readonly name: string;
  };
};

type TokenCondition = {
  request_ip: {
    in: string[];
    not_in: string[];
  };
};

// #endregion

/**
 * User API Tokens. Tokens that cab be used to access Cloudflare v4 APIs.
 * @see https://api.cloudflare.com/#user-api-tokens-properties
 */
export function userTokens(credentials: Credentials) {
  const url = `${baseUrl}/user/tokens`;

  return {
    /**
     * Token Details
     * @see https://api.cloudflare.com/#user-api-tokens-token-details
     */
    get: createFetch((id: string) => ({
      method: HttpMethod.GET,
      url: `${url}/${id}`,
      credentials,
    })).response<Token>(),

    /**
     * Verify Token
     * @see https://api.cloudflare.com/#user-api-tokens-verify-token
     * @throws {FetchError}
     */
    verify: createFetch(() => ({
      method: HttpMethod.GET,
      url: `${url}/verify`,
      credentials,
    })).response<Pick<Token, "id" | "status">>(),
  };
}
