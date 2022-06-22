/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import * as cf from "./user.js";

const options = { accessToken: process.env.CLOUDFLARE_API_TOKEN as string };

test("user(options).get()", async () => {
  const res = await cf.user(options).get();

  // Anonymize the response
  if (res.result) {
    res.result.id = res.result.id?.replace(/\w/g, "x");
    res.result.email = res.result.email
      .replace(/^.*@/, "email@")
      .replace(/@.*$/, "@example.com");
    res.result.organizations.length = 0;
    res.result.betas.length = 0;
    res.result.created_on = res.result.created_on.replace(/\d/g, "0");
    res.result.modified_on = res.result.modified_on.replace(/\d/g, "0");
    res.result.username =
      typeof res.result.username === "string" ? "username" : null;
  }

  expect(res).toMatchInlineSnapshot(`
    Object {
      "errors": Array [],
      "messages": Array [],
      "result": Object {
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
      },
      "success": true,
    }
  `);
});
