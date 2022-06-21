/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { baseUrl, createFetch, type Res } from "./fetch.js";

// #region TypeScript

type Options = {
  accessToken: string;
};

type VerifyResponse = Res<{
  id: string;
  status: "active" | string;
  not_before: string;
  expires_on: string;
}>;

// #endregion

function userTokens(options: Options) {
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
  };
}

export { userTokens, type VerifyResponse };
