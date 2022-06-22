/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";

if (!existsSync(".env")) {
  await writeFile(
    ".env",
    [
      "# Cloudflare Credentials",
      "# https://dash.cloudflare.com/profile/api-tokens",
      "",
      "CLOUDFLARE_ACCOUNT_ID=xxxxx",
      "CLOUDFLARE_ZONE_ID=xxxxx",
      "CLOUDFLARE_API_TOKEN=xxxxx",
      "",
      "CLOUDFLARE_AUTH_KEY=xxxxx",
      "CLOUDFLARE_AUTH_EMAIL=xxx@xxx.com",
      "",
    ].join("\n"),
    "utf-8"
  );
}
