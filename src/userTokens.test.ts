/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { userTokens as createTokensClient, type Token } from "./userTokens.js";

// Initialize an HTTP client for accessing API tokens (metadata)
const userTokens = createTokensClient({
  accessToken: process.env.CLOUDFLARE_API_TOKEN as string,
});

// Alternatively, use auth key/email credentials
const userTokensAlt = createTokensClient({
  authKey: process.env.CLOUDFLARE_AUTH_KEY as string,
  authEmail: process.env.CLOUDFLARE_AUTH_EMAIL as string,
});

test("userTokens.verify() [valid]", async () => {
  const tokenStatus = await userTokens.verify();
  expect(anonymize(tokenStatus)).toMatchInlineSnapshot(`
    Object {
      "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "status": "active",
    }
  `);
});

test("userTokens.verify() [invalid]", async () => {
  const accessToken = "8M7wS6hCpXVc-DoRnPPY_UCWPgy8aea4Wy6kCe5T";
  const promise = createTokensClient({ accessToken }).verify();
  expect(promise).rejects.toEqual(
    expect.objectContaining({
      code: 1000,
      message: "Invalid API Token",
    })
  );
});

test("userTokens.get(id)", async () => {
  const tokenStatus = await userTokens.verify();
  const token = await userTokensAlt.get(tokenStatus.id);
  expect(anonymize(token)).toMatchInlineSnapshot(`
    Object {
      "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "issued_on": "0000-00-00T00:00:00Z",
      "last_used_on": "0000-00-00T00:00:00Z",
      "modified_on": "0000-00-00T00:00:00Z",
      "name": "Token Name",
      "policies": Array [
        Object {
          "effect": "allow",
          "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
          "permission_groups": Array [
            Object {
              "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
              "name": "Permission Name",
            },
          ],
          "resources": Object {},
        },
      ],
      "status": "active",
    }
  `);
});

// #region Utils

function anonymize<T extends Partial<Token>>(data?: T): T | undefined {
  return (
    data && {
      ...data,
      ...("id" in data && { id: data.id?.replace(/\w/g, "x") }),
      ...("name" in data && { name: data.name && "Token Name" }),
      ...("issued_on" in data && {
        issued_on: data.issued_on
          ?.replace(/\d/g, "0")
          .replace(/\.0+Z/, ".000Z"),
      }),
      ...("last_used_on" in data && {
        last_used_on: data.last_used_on
          ?.replace(/\d/g, "0")
          .replace(/\.0+Z/, ".000Z"),
      }),
      ...("modified_on" in data && {
        modified_on: data.modified_on
          ?.replace(/\d/g, "0")
          .replace(/\.0+Z/, ".000Z"),
      }),
      ...("policies" in data && {
        policies:
          data.policies && data.policies[0]
            ? [
                {
                  ...data.policies[0],
                  id: data.policies[0].id?.replace(/\w/g, "x"),
                  ...("permission_groups" in data.policies[0] && {
                    permission_groups: [
                      {
                        ...data.policies[0].permission_groups[0],
                        id: data.policies[0].permission_groups[0].id?.replace(
                          /\w/g,
                          "x"
                        ),
                        name:
                          data.policies[0].permission_groups[0].name &&
                          "Permission Name",
                      },
                    ],
                  }),
                  ...("resources" in data.policies[0] && { resources: {} }),
                },
              ]
            : data.policies,
      }),
    }
  );
}

// #endregion
