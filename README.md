# Cloudflare API Client

[![NPM Version](https://img.shields.io/npm/v/cloudflare-client?style=flat-square)](https://www.npmjs.com/package/cloudflare-client)
[![NPM Downloads](https://img.shields.io/npm/dm/cloudflare-client?style=flat-square)](https://www.npmjs.com/package/cloudflare-client)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg?style=flat-square)](http://www.typescriptlang.org/)
[![Donate](https://img.shields.io/badge/dynamic/json?color=%23ff424d&label=Patreon&style=flat-square&query=data.attributes.patron_count&suffix=%20patrons&url=https%3A%2F%2Fwww.patreon.com%2Fapi%2Fcampaigns%2F233228)](http://patreon.com/koistya)
[![Discord](https://img.shields.io/discord/643523529131950086?label=Chat&style=flat-square)](https://discord.gg/bSsv7XM)

An HTTP client for [Cloudflare API](https://api.cloudflare.com/) that works in Node.js, browser, and CF Workers environment.

```bash
# Install using NPM
$ npm install cloudflare-client --save

# Install using Yarn
$ yarn add cloudflare-client
```

## Usage Example

```ts
import * as cf from "cloudflare-client";

const settings = { zoneId: "xxx", accessToken: "<CLOUDFLARE_API_TOKEN>" };

// Get the currently logged in / authenticated user
// https://api.cloudflare.com/#user-user-details
await cf.user(settings).get();

// Verify the user's token
// https://api.cloudflare.com/#user-api-tokens-verify-token
await cf.userTokens(settings).verify();

// Get DNS Record details
// https://api.cloudflare.com/#dns-records-for-a-zone-dns-record-details
await cf.dnsRecords(settings).get("xxx");

// Find a single DNS Record matching the search parameters
// https://api.cloudflare.com/#dns-records-for-a-zone-list-dns-records
await cf.dnsRecords(settings).find({ type: "A" });

// Get the list of DNS Records for the target zone
// https://api.cloudflare.com/#dns-records-for-a-zone-list-dns-records
await cf.dnsRecords(settings).findMany({ type: "A" });
```

## Source Code

For more information and usage examples check out the source code / tests:

- **[`user.ts`](./src/user.ts)** ([tests](./src/user.test.ts))
- **[`userTokens.ts`](./src/userTokens.ts)** ([tests](./src/userTokens.test.ts))
- **[`dnsRecords.ts`](./src/dnsRecords.ts)** ([tests](./src/dnsRecords.test.ts))

## Backers 💰

<a href="https://reactstarter.com/b/1"><img src="https://reactstarter.com/b/1.png" height="60" /></a>&nbsp;&nbsp;<a href="https://reactstarter.com/b/2"><img src="https://reactstarter.com/b/2.png" height="60" /></a>&nbsp;&nbsp;<a href="https://reactstarter.com/b/3"><img src="https://reactstarter.com/b/3.png" height="60" /></a>&nbsp;&nbsp;<a href="https://reactstarter.com/b/4"><img src="https://reactstarter.com/b/4.png" height="60" /></a>&nbsp;&nbsp;<a href="https://reactstarter.com/b/5"><img src="https://reactstarter.com/b/5.png" height="60" /></a>&nbsp;&nbsp;<a href="https://reactstarter.com/b/6"><img src="https://reactstarter.com/b/6.png" height="60" /></a>&nbsp;&nbsp;<a href="https://reactstarter.com/b/7"><img src="https://reactstarter.com/b/7.png" height="60" /></a>&nbsp;&nbsp;<a href="https://reactstarter.com/b/8"><img src="https://reactstarter.com/b/8.png" height="60" /></a>

## Related Projects

- [Cloudflare Workers Starter Kit](https://github.com/kriasoft/cloudflare-starter-kit) — TypeScript project template for Cloudflare Workers
- [React Starter Kit](https://github.com/kriasoft/react-starter-kit) — front-end template for React and Relay using Jamstack architecture
- [GraphQL API and Relay Starter Kit](https://github.com/kriasoft/graphql-starter) — monorepo template, pre-configured with GraphQL API, React, and Relay

## How to Contribute

You're very welcome to [create a PR](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)
or send me a message on [Discord](https://discord.gg/bSsv7XM).

## License

Copyright © 2022-present Kriasoft. This source code is licensed under the MIT license found in the
[LICENSE](https://github.com/kriasoft/cloudflare-client/blob/main/LICENSE) file.

---

<sup>Made with ♥ by Konstantin Tarkus ([@koistya](https://twitter.com/koistya), [blog](https://medium.com/@koistya))
and [contributors](https://github.com/kriasoft/cloudflare-client/graphs/contributors).</sup>
