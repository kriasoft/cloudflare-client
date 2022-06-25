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
      /**
       * Cloudflare API token
       */
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
  code: number;
  message: string;
  type?: string;
};

export interface Response {
  success: boolean;
  errors: Message[];
  messages: Message[];
}

interface QueryResponse<T> extends AsyncIterable<T> {
  all: () => Promise<Array<T>>;
  first: () => Promise<T | undefined>;
  totalCount: number;
}

export interface Query<T>
  extends Promise<QueryResponse<T>>,
    Omit<QueryResponse<T>, "totalCount"> {
  all: () => Promise<Array<T>>;
  first: () => Promise<T | undefined>;
}

// #endregion

export const baseUrl = `https://api.cloudflare.com/client/v4`;

export function createFetch<I extends FetchInit>(
  init: I
): {
  response: <R>() => (...args: Parameters<I>) => Promise<R>;
  query: <R>() => (...args: Parameters<I>) => Query<R>;
} {
  function createRequest(...args: Parameters<I>): [Request, FetchOptions] {
    const options = init(...args);
    const { searchParams, credentials } = options;
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

    return [req, options];
  }

  return {
    response() {
      return async function (...args: Parameters<I>) {
        const [req, options] = createRequest(...args);

        // Make an HTTP request
        const res = options.body
          ? await fetch(new Request(req, { body: options.body }))
          : await fetch(req);

        if (res.status === 404 && "notFoundResponse" in options) {
          return options.notFoundResponse;
        }

        if (!res.ok) {
          const body = await res.json();
          throw new FetchError(body, res);
        }

        const data =
          options.type === "text"
            ? await res.text()
            : options.type === "binary"
            ? await res.arrayBuffer()
            : await res.json();

        if (options.type) return data;

        if (data?.success === false) {
          throw new FetchError(data, res);
        }

        return data.result;
      };
    },

    query() {
      return function (...args: Parameters<I>) {
        const [req, options] = createRequest(...args);

        const promise = (async () => {
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
        })();

        const result = {
          async *[Symbol.asyncIterator]() {
            const res = await promise;

            if (Array.isArray(res.result)) {
              for (const item of res.result) {
                yield item;
              }
            }
          },

          async all() {
            const items: unknown[] = [];

            for await (const item of this) {
              items.push(item);
            }

            return items;
          },

          async first() {
            for await (const item of this) {
              return item;
            }
          },
        };

        return Object.assign(
          promise.then(() => result),
          result
        );
      };
    },
    // TEMP
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as { response: () => any; query: () => any };
}

export class FetchError extends Error {
  public readonly code: number;
  public readonly errors: Message[];
  public readonly messages: Message[];
  public readonly response: globalThis.Response;

  constructor(data: Response, res: globalThis.Response) {
    super(data.errors[0]?.message ?? "HTTP request failed");
    this.name = "FetchError";
    this.code = data.errors[0]?.code ?? 0;
    this.errors = data.errors ?? [];
    this.messages = data.messages ?? [];
    this.response = res;

    // https://www.typescriptlang.org/docs/handbook/2/classes.html#inheriting-built-in-types
    Object.setPrototypeOf(this, FetchError.prototype);
  }
}
