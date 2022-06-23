/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { customAlphabet } from "nanoid";
import { kv, type CreateNamespaceResponse } from "./kv.js";

const newId = customAlphabet("1234567890abcdef", 5);

const options = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID as string,
  authKey: process.env.CLOUDFLARE_AUTH_KEY as string,
  authEmail: process.env.CLOUDFLARE_AUTH_EMAIL as string,
};

test("kv(options).createNamespace(title)", async () => {
  const title = `test-${newId()}`;
  const res = await kv(options).createNamespace(title);

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

  if (!res.result) return;

  const updateRes = await kv(options).updateNamespace(
    res.result.id,
    `${res.result.title}-renamed`
  );

  expect(updateRes).toMatchInlineSnapshot(`
    Object {
      "errors": Array [],
      "messages": Array [],
      "result": null,
      "success": true,
    }
  `);
});

test("kv(options).getKeys()", async () => {
  const title = `test-${newId()}`;
  const nsRes = await kv(options).createNamespace(title);
  const namespaceId = nsRes.result?.id as string;
  expect(namespaceId).toBeTruthy();
  const testKv = kv({ ...options, namespaceId });
  const keysRes = await testKv.getKeys();
  expect(keysRes).toMatchInlineSnapshot(`
    Object {
      "errors": Array [],
      "messages": Array [],
      "result": Array [],
      "result_info": Object {
        "count": 0,
        "cursor": "",
      },
      "success": true,
    }
  `);
  const setTextRes = await testKv.set("josé", `José`);
  expect(setTextRes).toMatchInlineSnapshot(`
    Object {
      "errors": Array [],
      "messages": Array [],
      "result": null,
      "success": true,
    }
  `);
  const getTextRes = await testKv.get<string>("josé");
  expect(getTextRes).toMatchInlineSnapshot(`"José"`);
  const setJsonRes = await testKv.set("josé-json", { name: "José" });
  expect(setJsonRes).toMatchInlineSnapshot(`
    Object {
      "errors": Array [],
      "messages": Array [],
      "result": null,
      "success": true,
    }
  `);
  const getJsonRes = await testKv.get("josé-json");
  expect(getJsonRes).toMatchInlineSnapshot(`
    Object {
      "name": "José",
    }
  `);
  const setRawRes = await testKv.set("josé-text", `José`, { json: false });
  expect(setRawRes).toMatchInlineSnapshot(`
    Object {
      "errors": Array [],
      "messages": Array [],
      "result": null,
      "success": true,
    }
  `);
  const getRawRes = await testKv.get("josé-text", { json: false });
  expect(getRawRes).toMatchInlineSnapshot(`"José"`);
}, 15000);

afterAll(async () => {
  const res = await kv(options).getNamespaces({ per_page: 100 });

  for (const ns of res.result ?? []) {
    if (/^test-\w{5}(|-renamed)$/.test(ns.title)) {
      await kv(options).deleteNamespace(ns.id);
    }
  }
});

function anonymize(res: CreateNamespaceResponse) {
  return (
    res && {
      ...res,
      result: res.result && {
        ...res.result,
        id: res.result.id?.replace(/\w/g, "x"),
        title: res.result.title?.replace(/-\w+$/, "-xxx"),
      },
    }
  );
}
