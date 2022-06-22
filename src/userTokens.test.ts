/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import * as cf from "./userTokens.js";

const options = { accessToken: process.env.CLOUDFLARE_API_TOKEN as string };

test("userTokens(options).verify() [valid]", async () => {
  const res = await cf.userTokens(options).verify();

  if (res.result) {
    // Anonymize the response
    res.result.id = res.result.id.replace(/\w/g, "x");
  }

  expect(res).toMatchInlineSnapshot(`
    Object {
      "errors": Array [],
      "messages": Array [
        Object {
          "code": 10000,
          "message": "This API Token is valid and active",
          "type": null,
        },
      ],
      "result": Object {
        "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "status": "active",
      },
      "success": true,
    }
  `);
});

test("userTokens(options).verify() [invalid]", async () => {
  const accessToken = "8M7wS6hCpXVc-DoRnPPY_UCWPgy8aea4Wy6kCe5T";
  const res = await cf.userTokens({ accessToken }).verify();
  expect(res).toMatchInlineSnapshot(`
    Object {
      "errors": Array [
        Object {
          "code": 1000,
          "message": "Invalid API Token",
        },
      ],
      "messages": Array [],
      "result": null,
      "success": false,
    }
  `);
});

test("userTokens(options).get(id)", async () => {
  const tokenRes = await cf.userTokens(options).verify();
  expect(tokenRes.result?.id).toBeTruthy();
  const id = tokenRes.result?.id as string;
  const res = await cf.userTokens(options).get(id);
  // TODO: Fix permissions
  expect(res).toMatchInlineSnapshot(`
    Object {
      "errors": Array [
        Object {
          "code": 9109,
          "message": "Unauthorized to access requested resource",
        },
      ],
      "messages": Array [],
      "result": null,
      "success": false,
    }
  `);
});
