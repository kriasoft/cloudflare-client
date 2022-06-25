/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { customAlphabet } from "nanoid";
import {
  dnsRecords as createDnsRecords,
  type DnsRecord,
} from "./dnsRecords.js";

// Initialize DNS Records client
const dnsRecords = createDnsRecords({
  zoneId: process.env.CLOUDFLARE_ZONE_ID as string,
  accessToken: process.env.CLOUDFLARE_API_TOKEN as string,
});

const dnsRecordsAlt = createDnsRecords({
  zoneId: process.env.CLOUDFLARE_ZONE_ID as string,
  authKey: process.env.CLOUDFLARE_AUTH_KEY as string,
  authEmail: process.env.CLOUDFLARE_AUTH_EMAIL as string,
});

// Random ID generator
const newId = customAlphabet("1234567890abcdef", 5);

test("dnsRecords.find(options).all()", async () => {
  const records = await dnsRecords.find({ type: "A" }).all();

  const result = Array.isArray(records)
    ? records.length > 0
      ? [anonymize(records[0])]
      : []
    : records;

  expect(result).toMatchInlineSnapshot(`
    Array [
      Object {
        "content": "192.0.2.1",
        "created_on": "0000-00-00T00:00:00.000Z",
        "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "locked": false,
        "meta": Object {
          "auto_added": false,
          "managed_by_apps": false,
          "managed_by_argo_tunnel": false,
          "source": "primary",
        },
        "modified_on": "0000-00-00T00:00:00.000Z",
        "name": "xxx.xxx.xxx",
        "proxiable": true,
        "proxied": true,
        "ttl": 1,
        "type": "A",
        "zone_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "zone_name": "xxx.xxx",
      },
    ]
  `);
});

test("dnsRecords.find(options).first()", async () => {
  const record = await dnsRecords.find({ type: "A" }).first();
  expect(anonymize(record)).toMatchInlineSnapshot(`
    Object {
      "content": "192.0.2.1",
      "created_on": "0000-00-00T00:00:00.000Z",
      "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "locked": false,
      "meta": Object {
        "auto_added": false,
        "managed_by_apps": false,
        "managed_by_argo_tunnel": false,
        "source": "primary",
      },
      "modified_on": "0000-00-00T00:00:00.000Z",
      "name": "xxx.xxx.xxx",
      "proxiable": true,
      "proxied": true,
      "ttl": 1,
      "type": "A",
      "zone_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "zone_name": "xxx.xxx",
    }
  `);

  const notFound = await dnsRecords.find({ type: "URI" }).first();
  expect(notFound).toBeUndefined();
});

test("dnsRecords.create(record)", async () => {
  const record = await dnsRecords.create({
    type: "A",
    name: `test-${newId()}`,
    content: `192.0.2.1`,
    ttl: 1,
  });

  expect(anonymize(record)).toMatchInlineSnapshot(`
    Object {
      "content": "192.0.2.1",
      "created_on": "0000-00-00T00:00:00.000Z",
      "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "locked": false,
      "meta": Object {
        "auto_added": false,
        "managed_by_apps": false,
        "managed_by_argo_tunnel": false,
        "source": "primary",
      },
      "modified_on": "0000-00-00T00:00:00.000Z",
      "name": "xxx.xxx.xxx",
      "proxiable": true,
      "proxied": true,
      "ttl": 1,
      "type": "A",
      "zone_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "zone_name": "xxx.xxx",
    }
  `);
});

// Remove DNS records created during the tests
afterAll(async () => {
  const records = dnsRecords.find({ type: "A" });
  const queue: Promise<unknown>[] = [];

  for await (const record of records) {
    if (/^test-\w{5}\./.test(record.name)) {
      queue.push(dnsRecordsAlt.delete(record.id));
    }
  }

  await Promise.all(queue);
});

function anonymize(
  data?: Partial<DnsRecord> | null
): Partial<DnsRecord> | null | undefined {
  return (
    data && {
      ...data,
      ...("id" in data && { id: data.id?.replace(/\w/g, "x") }),
      ...("name" in data && { name: data.name?.replace(/[\w-]+/g, "xxx") }),
      ...("content" in data && { content: data.content && "192.0.2.1" }),
      ...("zone_id" in data && { zone_id: data.zone_id?.replace(/\w/g, "x") }),
      ...("zone_name" in data && {
        zone_name: data.zone_name?.replace(/[\w-]+/g, "xxx"),
      }),
      ...("created_on" in data && {
        created_on: data.created_on
          ?.replace(/\d/g, "0")
          .replace(/\.0+Z/, ".000Z"),
      }),
      ...("modified_on" in data && {
        modified_on: data.modified_on
          ?.replace(/\d/g, "0")
          .replace(/\.0+Z/, ".000Z"),
      }),
      ...("proxied" in data &&
        typeof data.proxied === "boolean" && { proxied: true }),
    }
  );
}
