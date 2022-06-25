/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { user as createUser, type User } from "./user.js";

// Initialize an HTTP client for accessing the currently
// logged in / authenticated user's assets
const user = createUser({
  accessToken: process.env.CLOUDFLARE_API_TOKEN as string,
});

// Alternatively, use auth key/email credentials
const userAlt = createUser({
  authKey: process.env.CLOUDFLARE_AUTH_KEY as string,
  authEmail: process.env.CLOUDFLARE_AUTH_EMAIL as string,
});

test("user.get()", async () => {
  const userDetails = await user.get();
  expect(anonymize(userDetails)).toMatchInlineSnapshot(`
    Object {
      "betas": Array [],
      "country": null,
      "created_on": "0000-00-00T00:00:00.000000Z",
      "email": "email@example.com",
      "first_name": null,
      "has_business_zones": false,
      "has_enterprise_zones": false,
      "has_pro_zones": false,
      "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "last_name": null,
      "modified_on": "0000-00-00T00:00:00.000000Z",
      "organizations": Array [],
      "suspended": false,
      "telephone": null,
      "two_factor_authentication_enabled": true,
      "two_factor_authentication_locked": true,
      "username": "username",
      "zipcode": null,
    }
  `);
});

test("user.get() /w auth key/email", async () => {
  const userDetails = await userAlt.get();
  expect(anonymize(userDetails)).toMatchInlineSnapshot(`
    Object {
      "betas": Array [],
      "country": null,
      "created_on": "0000-00-00T00:00:00.000000Z",
      "email": "email@example.com",
      "first_name": null,
      "has_business_zones": false,
      "has_enterprise_zones": false,
      "has_pro_zones": false,
      "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "last_name": null,
      "modified_on": "0000-00-00T00:00:00.000000Z",
      "organizations": Array [],
      "suspended": false,
      "telephone": null,
      "two_factor_authentication_enabled": true,
      "two_factor_authentication_locked": true,
      "username": "username",
      "zipcode": null,
    }
  `);
});

// #region Utils

function anonymize<T extends User | undefined>(user: T): T {
  return (
    user && {
      ...user,
      ...("id" in user && { id: user.id?.replace(/\w/g, "x") }),
      ...("email" in user && {
        email: user.email
          .replace(/^.*@/, "email@")
          .replace(/@.*$/, "@example.com"),
      }),
      ...("organizations" in user && {
        organizations: user.organizations && [],
      }),
      ...("betas" in user && {
        betas: user.betas && [],
      }),
      ...("created_on" in user && {
        created_on: user.created_on.replace(/\d/g, "0"),
      }),
      ...("modified_on" in user && {
        modified_on: user.modified_on.replace(/\d/g, "0"),
      }),
      ...("username" in user && {
        username: user.username && "username",
      }),
    }
  );
}

// #endregion
