/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

// #region TypeScript

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

type Options<P> = {
  method: HttpMethod;
  url: ((params: P) => string) | string;
  accessToken: string;
  single?: true;
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

    if (typeof params === "object") {
      Object.keys(params).forEach((key) => {
        url.searchParams.set(key, String(params[key]));
      });
    }

    const res = await fetch(url, {
      method: options.method,
      headers: {
        [`Content-Type`]: `application/json`,
        [`Authorization`]: `Bearer ${options.accessToken}`,
      },
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
