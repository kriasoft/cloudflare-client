/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { customAlphabet } from "nanoid/async";
import { kv, type CreateNamespaceResponse } from "./kv.js";

const newId = customAlphabet("1234567890abcdef", 5);

const options = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID as string,
  authKey: process.env.CLOUDFLARE_AUTH_KEY as string,
  authEmail: process.env.CLOUDFLARE_AUTH_EMAIL as string,
};

test("kv(options).createNamespace({ title })", async () => {
  const title = `test-${await newId()}`;
  const res = await kv(options).createNamespace({ title });

  expect(anonymize(res)).toMatchInlineSnapshot(`
    Object {
      "errors": Array [],
      "messages": Array [],
      "result": Object {
        "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "supports_url_encoding": true,
        "title": "test-xxx",
      },
      "success": true,
    }
  `);
});

afterAll(async () => {
  const res = await kv(options).getNamespaces({ per_page: 100 });

  for (const ns of res.result ?? []) {
    if (/^test-\w{5}$/.test(ns.title)) {
      await kv(options).deleteNamespace(ns.id);
    }
  }
});

function anonymize(res: CreateNamespaceResponse) {
  if (res.result) {
    res.result.id = res.result.id?.replace(/\w/g, "x");
    res.result.title = res.result.title?.replace(/-\w+$/, "-xxx");
  }

  return res;
}
