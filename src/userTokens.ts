/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import {
  baseUrl,
  createFetch,
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

export function userTokens(credentials: Credentials) {
  const url = `${baseUrl}/user/tokens`;

  return {
    /**
     * Verify Token
     * @see https://api.cloudflare.com/#user-api-tokens-verify-token
     */
    verify: createFetch<never, VerifyResponse>({
      method: "GET",
      url: `${url}/verify`,
      credentials,
    }) as () => Promise<VerifyResponse>,

    /**
     * Token Details
     * @see https://api.cloudflare.com/#user-api-tokens-token-details
     */
    get: createFetch<string, TokenResponse>({
      method: "GET",
      url: (id) => `${url}/${id}`,
      credentials,
    }) as (id: string) => Promise<TokenResponse>,
  };
}
