/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { customAlphabet } from "nanoid";
import { kv as createKv, type Namespace } from "./kv.js";

// Initialize a KV storage client
const kv = createKv({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID as string,
  authKey: process.env.CLOUDFLARE_AUTH_KEY as string,
  authEmail: process.env.CLOUDFLARE_AUTH_EMAIL as string,
});

// Random ID generator
const newId = customAlphabet("1234567890abcdef", 5);

test("kv.find()", async () => {
  await kv.create(`test-${newId()}`);
  const namespaces = kv.find();
  let count = 0;

  expect("size" in namespaces).toBe(false);

  // Can iterate through the list of namespaces
  for await (const namespace of namespaces) {
    expect(anonymize(namespace)).toMatchInlineSnapshot(`
      Object {
        "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "supports_url_encoding": true,
        "title": "xxxxx",
      }
    `);
    count++;
  }

  // At least one namespace found
  expect(count).toBeGreaterThan(0);
});

test("kv.find() /w await", async () => {
  await kv.create(`test-${newId()}`);
  const namespaces = await kv.find();
  let count = 0;

  for await (const namespace of namespaces) {
    expect(anonymize(namespace)).toMatchInlineSnapshot(`
      Object {
        "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "supports_url_encoding": true,
        "title": "xxxxx",
      }
    `);
    count++;
  }

  expect(count).toBeGreaterThan(0);
});

test("kv.create(name), kv.delete(name)", async () => {
  // Create a new namespace
  const name = `test-${newId()}`;
  const namespace = await kv.create(name);

  // Ensure that the target namespace was successfully created
  expect(anonymize(namespace)).toMatchInlineSnapshot(`
    Object {
      "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "supports_url_encoding": true,
      "title": "xxxxx",
    }
  `);

  // Creating a new namespace with the same name should fail
  await expect(kv.create(name)).rejects.toEqual(
    expect.objectContaining({
      code: 10014,
      message: `create namespace: 'a namespace with this account ID and title already exists'`,
    })
  );

  // Delete the created namespace
  await kv.delete(namespace.id);
});

test("kv.update(name)", async () => {
  expect.assertions(2);

  const nameBefore = `test-${newId()}`;
  const nameAfter = `test-${newId()}`;

  // Create a new namespace
  const namespace = await kv.create(nameBefore);
  expect(namespace.title).toEqual(nameBefore);

  // Update the namespace
  await kv.update(namespace.id, nameAfter);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const namespaces = await kv.find();

  // Look up the updated namespace and confirm
  for await (const ns of namespaces) {
    if (ns.id === namespace.id) {
      expect(ns.title).toEqual(nameAfter);
      break;
    }
  }
});

test("kv.create(name)", async () => {
  const res = await kv.create(`test-${newId()}`);
  expect(anonymize(res)).toMatchInlineSnapshot(`
    Object {
      "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "supports_url_encoding": true,
      "title": "xxxxx",
    }
  `);
});

test("kv.namespace(id).keys()", async () => {
  // Create a temporary KV namespace
  const { id } = await kv.create(`test-${newId()}`);
  const ns = kv.namespace(id);

  // Fetch the list of namespace's keys
  let keys = await ns.keys().all();
  expect(keys).toEqual([]);

  // Write a new kay-value pair
  await ns.set("josé", "José");
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Fetch the list of namespace's keys
  keys = await ns.keys().all();
  expect(keys).toMatchInlineSnapshot(`
    Array [
      Object {
        "name": "josé",
      },
    ]
  `);

  await ns.set("other", "other");
  await ns.set("joséf", "Joséf");
  await new Promise((resolve) => setTimeout(resolve, 1000));

  keys = await ns.keys({ prefix: "josé" }).all();
  expect(keys).toMatchInlineSnapshot(`
    Array [
      Object {
        "name": "josé",
      },
      Object {
        "name": "joséf",
      },
    ]
  `);

  await Promise.all(
    Array.from({ length: 15 }, async (_, i) => {
      await ns.set(`key-${i + 1}`, i + 1);
    })
  );

  keys = await ns.keys({ prefix: "key-", first: 10 }).all();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  expect(Array.isArray(keys)).toBe(true);
  expect(keys.length).toBe(10);
  expect(keys[0].name.startsWith("key-")).toBe(true);
});

test("kv.namespace(id).get/set() [json]", async () => {
  // Create a temporary KV namespace
  const { id } = await kv.create(`test-${newId()}`);

  // Write a new kay-value pair
  await kv.namespace(id).set("josé", "José");

  // Read key-value pair
  const value = await kv.namespace(id).get("josé");
  expect(value).toEqual("José");

  // Read a non-existent key-value pair
  const none = await kv.namespace(id).get("none");
  expect(none).toBeUndefined();
});

test("kv.namespace(id).get/set() [text]", async () => {
  // Create a temporary KV namespace
  const { id } = await kv.create(`test-${newId()}`);

  // Write a new kay-value pair
  await kv.namespace(id).set("josé", "José", { encode: false });

  // Read key-value pair
  const value = await kv.namespace(id).get("josé", { decode: false });
  expect(value).toEqual("José");
});

afterAll(async () => {
  const namespaces = await kv.find({ per_page: 100 });
  const queue: Promise<unknown>[] = [];

  // Remove all the test namespaces
  for await (const ns of namespaces) {
    if (/^test-\w{5}(|-renamed)$/.test(ns.title)) {
      queue.push(kv.delete(ns.id));
    }
  }

  await Promise.all(queue);
});

function anonymize(ns?: Namespace): Namespace | undefined {
  return (
    ns && {
      ...ns,
      id: ns.id?.replace(/\w/g, "x"),
      title: ns.title?.replace(/^.*$/, "xxxxx"),
    }
  );
}
