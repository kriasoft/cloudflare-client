/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { customAlphabet } from "nanoid";
import * as Cloudflare from "./customHostnames";

// Initialize custom hostnames client
const customHostnames = Cloudflare.customHostnames({
  zoneId: process.env.CLOUDFLARE_ZONE_ID as string,
  accessToken: process.env.CLOUDFLARE_API_TOKEN as string,
});

// Random ID generator
const newId = customAlphabet("1234567890abcdef", 5);

test("customHostnames", async () => {
  const hostname = `test-${newId()}.koistya.com`;

  // Create a new custom hostname
  const record = await customHostnames.create({ hostname });

  expect(record).toEqual(
    expect.objectContaining({
      hostname,
      id: expect.any(String),
      status: "pending",
      created_at: expect.any(String),
    })
  );

  // Fetch the list of custom hostnames
  const records = await customHostnames.find().all();

  expect(records).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: expect.any(String), hostname }),
    ])
  );

  // Fetch a custom hostname by its ID
  const details = await customHostnames.get(record.id);

  expect(details).toEqual(
    expect.objectContaining({
      hostname,
      id: expect.any(String),
      created_at: expect.any(String),
    })
  );

  // Delete a custom hostname
  const res = await customHostnames.delete(record.id);
  expect(res.id).toBe(record.id);

  await expect(customHostnames.get(record.id)).rejects.toEqual(
    expect.objectContaining({
      message: "The custom hostname was not found.",
    })
  );
});

// Remove custom hostnames created during the tests
afterAll(async () => {
  const records = customHostnames.find();
  const queue: Promise<unknown>[] = [];

  for await (const record of records) {
    if (/^test-\w{5}\./.test(record.hostname)) {
      queue.push(customHostnames.delete(record.id));
    }
  }

  await Promise.all(queue);
});
