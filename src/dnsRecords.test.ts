/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import * as cf from "./dnsRecords.js";

const dnsRecords = cf.dnsRecords({
  zoneId: process.env.CLOUDFLARE_ZONE_ID as string,
  accessToken: process.env.CLOUDFLARE_API_TOKEN as string,
});

test("dnsRecords({ zoneId, accessToken }).findMany()", async () => {
  const res = await dnsRecords.findMany({ type: "A" });

  if (res.result) {
    res.result.length = 1;
    // Anonymize the response
    res.result.forEach((record) => {
      record.id = record.id?.replace(/\w/g, "x");
      record.name = record.name?.replace(/[\w-]+/g, "xxx");
      record.content = record.content && "192.0.2.1";
      record.zone_id = record.zone_id?.replace(/\w/g, "x");
      record.zone_name = record.zone_name?.replace(/[\w-]+/g, "xxx");
      record.created_on = record.created_on?.replace(/\d/g, "0");
      record.modified_on = record.modified_on?.replace(/\d/g, "0");
    });
  }

  expect(res).toMatchInlineSnapshot(`
    Object {
      "errors": Array [],
      "messages": Array [],
      "result": Array [
        Object {
          "content": "192.0.2.1",
          "created_on": "0000-00-00T00:00:00.000000Z",
          "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
          "locked": false,
          "meta": Object {
            "auto_added": false,
            "managed_by_apps": false,
            "managed_by_argo_tunnel": false,
            "source": "primary",
          },
          "modified_on": "0000-00-00T00:00:00.000000Z",
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
        "count": 40,
        "page": 1,
        "per_page": 100,
        "total_count": 40,
        "total_pages": 1,
      },
      "success": true,
    }
  `);
});
