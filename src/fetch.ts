/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

// #region TypeScript

export type HttpMethod = "GET" | "PUT" | "POST" | "PATCH" | "DELETE";

export type Credentials =
  | {
      accessToken: string;
    }
  | {
      authKey: string;
      authEmail: string;
    };

type Options<P> = {
  method: HttpMethod;
  url: ((params: P) => string) | string;
  single?: true;
  credentials: Credentials;
};

export type Params = Record<string, string | number | unknown> | string;

export type Message = {
  code: string;
  message: string;
  type?: string;
};

export interface Res<T> {
  success: boolean;
  errors: Message[];
  messages: Message[];
  result: T | null;
}

export interface ListRes<T> extends Res<T[]> {
  result_info: {
    count: number;
    page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
}

export type CreateFetchOptions<P> = Options<P>;

// #endregion

export const baseUrl = `https://api.cloudflare.com/client/v4`;

export function createFetch<T extends Params, R>(options: Options<T>) {
  const fetchFn = async function (params: T): Promise<R> {
    const url = new URL(
      typeof options.url === "function" ? options.url(params) : options.url
    );

    if (options.method === "GET" && typeof params === "object") {
      Object.keys(params).forEach((key) => {
        url.searchParams.set(key, String(params[key]));
      });
    }

    const res = await fetch(url, {
      method: options.method,
      headers:
        "accessToken" in options.credentials
          ? {
              [`Content-Type`]: `application/json`,
              [`Authorization`]: `Bearer ${options.credentials.accessToken}`,
            }
          : {
              [`Content-Type`]: `application/json`,
              [`X-Auth-Key`]: options.credentials.authKey,
              [`X-Auth-Email`]: options.credentials.authEmail,
            },
      ...((options.method === "POST" || options.method === "PATCH") && {
        body: JSON.stringify(params),
      }),
    });

    const body = await res.json();

    if (options.single && Array.isArray(body.result)) {
      body.result = body.result[0];
      delete body.result_info;
    }

    return body;
  };

  Object.defineProperty(fetchFn, "name", { value: options.method });

  return fetchFn;
}
