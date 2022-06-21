/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import * as cf from "./userTokens.js";

test("userTokens({ accessToken }).verify() [valid]", async () => {
  const userTokens = cf.userTokens({
    accessToken: process.env.CLOUDFLARE_API_TOKEN as string,
  });

  const res = await userTokens.verify();

  if (res.result) {
    res.result.id = res.result.id?.replace(/\w/g, "x");
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

test("userTokens({ accessToken }).verify() [invalid]", async () => {
  const userTokens = cf.userTokens({
    accessToken: "8M7wS6hCpXVc-DoRnPPY_UCWPgy8aea4Wy6kCe5T",
  });

  const res = await userTokens.verify();

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
