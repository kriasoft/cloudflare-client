/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import {
  baseUrl,
  createFetch,
  HttpMethod,
  type Credentials,
  type DataResponse,
} from "./fetch.js";

// #region TypeScript

export type VerifyResponse = DataResponse<{
  id: string;
  status: "active" | string;
  not_before: string;
  expires_on: string;
}>;

export type Token = {
  id: string;
  name: string;
  status: "active" | string;
  issued_on: string;
  modified_on: string;
  not_before: string;
  expires_on: string;
  policies: {
    id: string;
    effect: "allow" | string;
    resources: string[];
    permission_groups: {
      id: string;
      name: string;
    };
  }[];
  condition: {
    request_ip: {
      in: string[];
      not_in: string[];
    };
  };
};

export type TokenResponse = DataResponse<Token>;

// #endregion

/**
 * User API Tokens. Tokens that cab be used to access Cloudflare v4 APIs.
 * @see https://api.cloudflare.com/#user-api-tokens-properties
 */
export function userTokens(credentials: Credentials) {
  const url = `${baseUrl}/user/tokens`;

  return {
    /**
     * Verify Token
     * @see https://api.cloudflare.com/#user-api-tokens-verify-token
     */
    verify: createFetch(() => ({
      method: HttpMethod.GET,
      url: `${url}/verify`,
      credentials,
    })).json<VerifyResponse>(),

    /**
     * Token Details
     * @see https://api.cloudflare.com/#user-api-tokens-token-details
     */
    get: createFetch((id: string) => ({
      method: HttpMethod.GET,
      url: `${url}/${id}`,
      credentials,
    })).json<TokenResponse>(),
  };
}
