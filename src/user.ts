/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { baseUrl, createFetch, HttpMethod, type Credentials } from "./fetch.js";

// #region TypeScript

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

// #endregion

/**
 * The currently logged in / authenticated User
 * @see https://api.cloudflare.com/#user-properties
 */
export function user(credentials: Credentials) {
  const url = `${baseUrl}/user`;

  return {
    /**
     * The currently logged in/authenticated user
     * @see https://api.cloudflare.com/#user-properties
     */
    get: createFetch(() => ({
      method: HttpMethod.GET,
      url,
      credentials,
    })).response<User>(),
  };
}
