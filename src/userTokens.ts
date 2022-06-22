/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { baseUrl, createFetch, type Res } from "./fetch.js";

// #region TypeScript

type Options = {
  accessToken: string;
};

export type VerifyResponse = Res<{
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

export type TokenResponse = Res<Token>;
export type UserTokensOptions = Options;

// #endregion

export function userTokens(options: Options) {
  const url = `${baseUrl}/user/tokens`;

  return {
    /**
     * Verify Token
     * @see https://api.cloudflare.com/#user-api-tokens-verify-token
     */
    verify: createFetch<never, VerifyResponse>({
      method: "GET",
      url: `${url}/verify`,
      accessToken: options.accessToken,
    }) as () => Promise<VerifyResponse>,

    /**
     * Token Details
     * @see https://api.cloudflare.com/#user-api-tokens-token-details
     */
    get: createFetch<string, TokenResponse>({
      method: "GET",
      url: (id) => `${url}/${id}`,
      accessToken: options.accessToken,
    }) as (id: string) => Promise<TokenResponse>,
  };
}
