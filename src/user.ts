/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { baseUrl, createFetch, type Res } from "./fetch.js";

// #region TypeScript

type Options = {
  accessToken: string;
};

export type User = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  telephone: string | null;
  country: string | null;
  zipcode: string | null;
  created_on: string;
  modified_on: string;
  two_factor_authentication_enabled: boolean;
  two_factor_authentication_locked: boolean;
  has_pro_zones: boolean;
  has_business_zones: boolean;
  has_enterprise_zones: boolean;
  organizations: Organization[];
  betas: string[];
  suspended: boolean;
};

export type Organization = {
  id: string;
  name: string;
  permissions: string[];
  roles: string[];
  status: string;
};

export type UserResponse = Res<User>;
export type UserOptions = Options;

// #endregion

export function user(options: Options) {
  const url = `${baseUrl}/user`;

  return {
    /**
     * The currently logged in/authenticated user
     * @see https://api.cloudflare.com/#user-properties
     */
    get: createFetch<never, UserResponse>({
      method: "GET",
      url,
      accessToken: options.accessToken,
    }) as () => Promise<UserResponse>,
  };
}
