/* SPDX-FileCopyrightText: 2022-present Kriasoft */
/* SPDX-License-Identifier: MIT */

// #region TypeScript

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

type Options = {
  method: HttpMethod;
  url: string;
  accessToken: string;
};

type Params = Record<string, string | number | unknown> | string;

type Message = {
  code: string;
  message: string;
  type?: string;
};

type Res<T> = {
  success: boolean;
  errors: Message[];
  messages: Message[];
  result: T;
};

// #endregion

const baseUrl = `https://api.cloudflare.com/client/v4`;

function createFetch<T extends Params, R>(options: Options) {
  const fetchFn = async function (params: T): Promise<R> {
    const url = new URL(options.url);

    if (typeof params === "object") {
      Object.keys(params).forEach((key) => {
        url.searchParams.set(key, String(params[key]));
      });
    }

    console.log(url.toString(), options.accessToken);

    const res = await fetch(url, {
      method: options.method,
      headers: {
        [`Content-Type`]: `application/json`,
        [`Authorization`]: `Bearer ${options.accessToken}`,
      },
    });

    return res.json();
  };

  Object.defineProperty(fetchFn, "name", { value: options.method });

  return fetchFn;
}

export { baseUrl, createFetch, type Res };
