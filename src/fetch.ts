/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

// #region TypeScript

export enum HttpMethod {
  GET = "GET",
  PUT = "PUT",
  POST = "POST",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export type Credentials =
  | {
      accessToken: string;
    }
  | {
      authKey: string;
      authEmail: string;
    };

type FetchOptions = {
  method: HttpMethod;
  url: URL | string;
  searchParams?: Record<string, unknown>;
  contentType?: string;
  accept?: string;
  body?: BodyInit;
  single?: true;
  type?: "text" | "json" | "binary";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notFoundResponse?: any;
  credentials: Credentials;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FetchInit = (...args: ReadonlyArray<any>) => FetchOptions;

export type Params = Record<string, string | number | unknown> | string;

export type Message = {
  code: string;
  message: string;
  type?: string;
};

export interface Response {
  success: boolean;
  errors: Message[];
  messages: Message[];
}

export interface DataResponse<T> extends Response {
  result: T | null;
}

export interface ListResponse<T> extends DataResponse<T[]> {
  result_info: {
    count: number;
    page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
}

export interface CursorResponse<T> extends DataResponse<T[]> {
  result_info: {
    count: number;
    cursor: string;
  };
}

// #endregion

export const baseUrl = `https://api.cloudflare.com/client/v4`;

export function createFetch<I extends FetchInit>(
  init: I
): {
  json: <R>() => (...args: Parameters<I>) => Promise<R>;
} {
  return {
    json() {
      return async function (...args: Parameters<I>) {
        const { searchParams, credentials, ...options } = init(...args);
        const url = new URL(options.url);

        // Append URL (search) arguments to the URL
        if (typeof searchParams === "object") {
          Object.keys(searchParams).forEach((key) => {
            if (searchParams[key] !== undefined) {
              url.searchParams.set(key, String(searchParams[key]));
            }
          });
        }

        const req = new Request(url, { method: options.method });
        const contentType =
          "contentType" in options ? options.contentType : "application/json";

        if (contentType) {
          req.headers.set("Content-Type", contentType);
        }

        // Set authentication header(s)
        if ("accessToken" in credentials) {
          req.headers.set("Authorization", `Bearer ${credentials.accessToken}`);
        } else {
          req.headers.set("X-Auth-Key", credentials.authKey);
          req.headers.set("X-Auth-Email", credentials.authEmail);
        }

        // Make an HTTP request
        const res = options.body
          ? await fetch(new Request(req, { body: options.body }))
          : await fetch(req);

        if (res.status === 404 && "notFoundResponse" in options) {
          return options.notFoundResponse;
        }

        const data =
          options.type === "text" ? await res.text() : await res.json();

        if (options.single && Array.isArray(data.result)) {
          data.result = data.result[0];
          delete data.result_info;
        }

        return data;
      };
    },
  };
}
