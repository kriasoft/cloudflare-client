/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import {
  userTokens,
  VerifyResponse,
  type TokenResponse,
} from "./userTokens.js";

const credentials = {
  accessToken: process.env.CLOUDFLARE_API_TOKEN as string,
};

test("userTokens(credentials).verify() [valid]", async () => {
  const res = await userTokens(credentials).verify();

  expect(anonymize(res)).toMatchInlineSnapshot(`
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

test("userTokens(credentials).verify() [invalid]", async () => {
  const accessToken = "8M7wS6hCpXVc-DoRnPPY_UCWPgy8aea4Wy6kCe5T";
  const res = await userTokens({ accessToken }).verify();
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

test("userTokens(credentials).get(id)", async () => {
  const tokenRes = await userTokens(credentials).verify();
  expect(tokenRes.result?.id).toBeTruthy();
  const id = tokenRes.result?.id as string;
  const res = await userTokens(credentials).get(id);
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

function anonymize<T extends TokenResponse | VerifyResponse | undefined>(
  res: T
): T {
  return (
    res && {
      ...res,
      result: res.result && {
        ...res.result,
        id: res.result.id.replace(/\w/g, "x"),
      },
    }
  );
}
