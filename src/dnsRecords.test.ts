/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { dnsRecords, type DnsRecord } from "./dnsRecords.js";

const options = {
  zoneId: process.env.CLOUDFLARE_ZONE_ID as string,
  accessToken: process.env.CLOUDFLARE_API_TOKEN as string,
};

test("dnsRecords(options).findMany()", async () => {
  const res = await dnsRecords(options).findMany({ type: "A" });

  if (res.result) {
    // Limit the result set
    res.result.length = 1;
    anonymize(res.result[0]);

    if (typeof res.result_info.count === "number") {
      res.result_info.count = 10;
    }

    if (typeof res.result_info.total_count === "number") {
      res.result_info.total_count = 10;
    }
  }

  dnsRecords({ zoneId: "xxx", accessToken: "11", authEmail: "xxx" }).find();

  expect(res).toMatchInlineSnapshot(`
    Object {
      "errors": Array [],
      "messages": Array [],
      "result": Array [
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
      ],
      "result_info": Object {
        "count": 10,
        "page": 1,
        "per_page": 100,
        "total_count": 10,
        "total_pages": 1,
      },
      "success": true,
    }
  `);
});

test("dnsRecords(options).findMany()", async () => {
  const res = await dnsRecords(options).find({ type: "A" });
  anonymize(res.result);

  expect(res).toMatchInlineSnapshot(`
    Object {
      "errors": Array [],
      "messages": Array [],
      "result": Object {
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
      "success": true,
    }
  `);
});

test("dnsRecords(options).create(record)", async () => {
  const res = await dnsRecords(options).create({
    type: "A",
    name: `test-temp-${Math.floor(Math.random() * 1000)}`,
    content: `192.0.2.1`,
    ttl: 1,
  });

  const recordId = res.result?.id as string;

  anonymize(res.result);

  try {
    expect(res).toMatchInlineSnapshot(`
      Object {
        "errors": Array [],
        "messages": Array [],
        "result": Object {
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
        "success": true,
      }
    `);
  } finally {
    const deleteRes = await dnsRecords({
      zoneId: process.env.CLOUDFLARE_ZONE_ID as string,
      authKey: process.env.CLOUDFLARE_AUTH_KEY as string,
      authEmail: process.env.CLOUDFLARE_AUTH_EMAIL as string,
    }).delete(recordId);

    if (deleteRes.result) {
      deleteRes.result.id = deleteRes.result.id.replace(/\w/g, "x");
    }

    expect(deleteRes).toMatchInlineSnapshot(`
      Object {
        "errors": Array [],
        "messages": Array [],
        "result": Object {
          "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        },
        "success": true,
      }
    `);
  }
});

function anonymize(record?: DnsRecord | null) {
  if (record) {
    record.id = record.id.replace(/\w/g, "x");
    record.name = record.name.replace(/[\w-]+/g, "xxx");
    record.content = record.content && "192.0.2.1";
    record.zone_id = record.zone_id.replace(/\w/g, "x");
    record.zone_name = record.zone_name.replace(/[\w-]+/g, "xxx");
    record.created_on = record.created_on
      .replace(/\d/g, "0")
      .replace(/\.0+Z/, ".000Z");
    record.modified_on = record.modified_on
      .replace(/\d/g, "0")
      .replace(/\.0+Z/, ".000Z");
    if (record.proxied === false) record.proxied = true;
  }
}
