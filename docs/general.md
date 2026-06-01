# General Functions

Browser-safe utilities exported from `melperjs`. No Node.js APIs are used here — every function runs in the browser and in Node.js without polyfills.

## Constants

`CONSTANTS` bundles a few character sets and integer bounds that other functions in this module rely on. Useful when you need the same alphabets in your own code.

- `CONSTANTS.LOWER_CASE` — lowercase ASCII letters (`a-z`).
- `CONSTANTS.UPPER_CASE` — uppercase ASCII letters (`A-Z`).
- `CONSTANTS.HEXADECIMAL` — hex digits (`0-9a-f`).
- `CONSTANTS.NUMBERS` — decimal digits (`0-9`).
- `CONSTANTS.INT32_MIN` — `-2147483648`.
- `CONSTANTS.INT32_MAX` — `2147483647`.

## Errors

### Exception(message, response = {}, name = null)

Builds a standard `Error` with two extra attached fields (`response`, custom `name`) so error handlers can carry HTTP-style context without subclassing. A null/empty `response` is normalized to `{}`.

- **Parameters:**
  - `message` (String): Human-readable error message.
  - `response` (Object): Arbitrary payload attached as `error.response`.
  - `name` (String|null): Overrides `error.name`. Defaults to `"Exception"`.
- **Returns:** `Error` with `.response` and `.name` populated.

## Time & Async

### time()

Current Unix timestamp in seconds (integer).

- **Returns:** Seconds since the epoch.

### sleepMs(milliseconds)

Promise that resolves after a delay, measured in milliseconds.

- **Parameters:**
  - `milliseconds` (Number): Delay in ms.
- **Returns:** `Promise<void>`.

### sleep(seconds)

Same as `sleepMs` but the delay is given in seconds.

- **Parameters:**
  - `seconds` (Number): Delay in seconds.
- **Returns:** `Promise<void>`.

### promiseTimeout(milliseconds, promise)

Races a promise against a timer. If the promise doesn't settle in time the result rejects; either way the timer is cleared.

- **Parameters:**
  - `milliseconds` (Number): Maximum wait time before rejecting.
  - `promise` (Promise): The work to await.
- **Returns:** Settles with the inner promise's value, or rejects with `Error("Promise timed out after Xms")`.

### promiseSilent(promise)

Awaits a promise but swallows both the resolved value and any rejection. Handy for fire-and-forget work where you only care about the side effects.

- **Parameters:**
  - `promise` (Promise): The promise to consume silently.
- **Returns:** `Promise<undefined>` that always resolves.

### forever(delayMs, task, onError = null, onFinally = null)

Runs `task` in an infinite loop with a delay between iterations. Errors are routed to `onError`; `onFinally` runs after every iteration regardless of outcome. Any of the three callbacks can return a new positive number to update `delayMs` on the fly (useful for adaptive polling).

Errors thrown from `task` are caught and routed to `onError`; the loop keeps running. Errors thrown from `onError` propagate out and stop the loop — useful for soft shutdown by throwing on a stop signal. Errors thrown from `onFinally` are caught and ignored so that observability/cleanup failures cannot kill the worker.

- **Parameters:**
  - `delayMs` (Number): Initial delay in milliseconds between iterations. Must be a positive finite number.
  - `task` (Function): Async function to invoke each iteration. Exceptions are caught and forwarded to `onError`.
  - `onError` (Function): Called with the caught error when `task` throws. Throwing from here aborts the loop.
  - `onFinally` (Function): Called after every iteration (success or failure). Errors thrown here are swallowed.
- **Returns:** Promise that never resolves on its own; it rejects when `delayMs` validation fails or when `onError` throws.
- **Throws:** When `delayMs` is not a positive finite number.

### retry(task, maxAttempts = 1, onError = null, {delayMs = 0, backoffFactor = 1} = {})

Calls `task` up to `maxAttempts` times, returning the first successful result. Optionally waits between retries with an exponential backoff (delay grows by `delayMs * backoffFactor^(attempt-1)`).

- **Parameters:**
  - `task` (Function): Async function to attempt.
  - `maxAttempts` (Number): Total attempt count (1 = no retries). Default `1`.
  - `onError` (Function): Called as `(error, attempt)` after each failed attempt.
  - `options.delayMs` (Number): Base delay between retries in ms. `0` disables delay.
  - `options.backoffFactor` (Number): Multiplier applied per attempt. `1` keeps delay constant; `2` doubles each retry.
- **Returns:** The first non-throwing result of `task`.
- **Throws:** The last error after `maxAttempts` failures.

## Strings

### isValidURL(url)

Tests whether the input parses as a valid URL via the `URL` constructor.

- **Parameters:**
  - `url` (String): Candidate URL.
- **Returns:** `Boolean`.

### splitTrim(string, separator = null)

Splits a string, trims each piece, and drops empty results. Default separator is `\r?\n` (any newline).

- **Parameters:**
  - `string` (String): Source text.
  - `separator` (String|RegExp|null): Custom delimiter; `null` falls back to newlines.
- **Returns:** Array of non-empty trimmed strings.

### pascalCase(string)

Converts arbitrary text to `PascalCase` (uses lodash internally).

- **Parameters:**
  - `string` (String): Input text.
- **Returns:** PascalCase string.

### titleCase(string, separator = " ")

Capitalizes the first letter of each word delimited by `separator`. Other characters are preserved as-is.

- **Parameters:**
  - `string` (String): Input text.
  - `separator` (String): Word boundary. Defaults to a single space.
- **Returns:** Title-cased string.

### limitString(string, limit = 35, omission = "...")

Truncates a string if it exceeds `limit` characters and appends `omission`. Strings shorter than the limit are returned unchanged.

- **Parameters:**
  - `string` (String): Input text.
  - `limit` (Number): Maximum length of the result (including `omission`).
  - `omission` (String): Suffix used when truncation happens.
- **Returns:** Possibly truncated string.

### safeString(string)

Strips HTML tags via the `xss` library and additionally removes the body of dangerous block tags (`<script>`, `<style>`, `<iframe>`, `<object>`, `<embed>`, `<form>`) so leftover CSS/markup cannot leak as text. CSS attribute sanitization is also disabled (no `<style>` attribute support). Intended for rendering untrusted text safely; not a substitute for a full HTML sanitizer like DOMPurify.

- **Parameters:**
  - `string` (String): Untrusted text.
- **Returns:** Sanitized string with no allowed tags.

### shuffleString(string)

Randomly reorders the characters in a string using lodash's `shuffle` (Fisher-Yates).

- **Parameters:**
  - `string` (String): Source string.
- **Returns:** Shuffled string of the same length.

## Random (non-cryptographic, Math.random)

### randomBoolean()

Returns a random `true` or `false` with uniform probability.

- **Returns:** `Boolean`.

### randomString(length, useNumbers = true, useUppercase = false)

Generates a random string from a configurable character set.

- **Parameters:**
  - `length` (Number): Output length.
  - `useNumbers` (Boolean): Include digits `0-9`.
  - `useUppercase` (Boolean): Include uppercase letters.
- **Returns:** Random string.

### randomHex(length)

Generates a random hexadecimal string.

- **Parameters:**
  - `length` (Number): Output length.
- **Returns:** Hex string of the requested length.

### randomInteger(min, max)

Returns a random integer in `[min, max)`. If called with a single argument it is treated as `max` with `min = 0` (e.g., `randomInteger(10)` returns `0..9`).

- **Parameters:**
  - `min` (Number): Inclusive lower bound, or `max` when called with one argument.
  - `max` (Number): Exclusive upper bound.
- **Returns:** Integer in `[min, max)`.
- **Throws:** When inputs are not numbers, or when `max <= min`.

### randomUuid(useDashes = true)

Generates a random UUID v4-shaped string. Not suitable for security tokens; use `secureRandomUuid` instead.

- **Parameters:**
  - `useDashes` (Boolean): When `false`, dashes are stripped.
- **Returns:** UUID string.

### randomWeighted(object)

Picks a random key from `object` with probability proportional to its weight. Returns `undefined` for empty or nullish input.

- **Parameters:**
  - `object` (Object): Map of key → positive weight.
- **Returns:** Selected key, or `undefined`.

### randomElement(object)

Picks a random value from an array or from an object's own enumerable values. Returns `undefined` for empty or nullish input.

- **Parameters:**
  - `object` (Array|Object): Source collection.
- **Returns:** A random value, or `undefined`.

## Deterministic Random (seeded)

### mulberry32(seed)

Returns a deterministic PRNG (Mulberry32) seeded by a 32-bit integer or by a string (hashed internally to 32 bits). Each call to the returned function produces a `[0, 1)` float. Very fast, but only 32 bits of state — not for cryptographic use.

- **Parameters:**
  - `seed` (Number|String): Seed value.
- **Returns:** Function that returns a `Number` in `[0, 1)` per call.

### seedHex(seed, length)

Builds a deterministic hex string of the requested length from a seed via `mulberry32`. Same seed always yields the same output. Useful for short, repeatable identifiers (e.g., proxy session stickiness).

- **Parameters:**
  - `seed` (Any): Seed value (coerced to string).
  - `length` (Number): Output length in hex characters. Required.
- **Returns:** Hex string.

## Predicates

### checkEmpty(value)

Like lodash's `isEmpty` but additionally treats `0` (numeric zero) as empty.

- **Parameters:**
  - `value` (Any): Value to test.
- **Returns:** `Boolean`.

### isInt32(value)

Tests whether `value` is an integer within the signed 32-bit range.

- **Parameters:**
  - `value` (Any): Value to test.
- **Returns:** `Boolean`.

### isPositiveNumber(value)

Tests whether `value` is a finite positive number (excludes `NaN`, `Infinity`, non-numbers, `0`, and negatives).

- **Parameters:**
  - `value` (Any): Value to test.
- **Returns:** `Boolean`.

## Objects

### coerceObjectNumbers(object)

Walks an object's own enumerable keys and converts string values that match a numeric pattern (e.g., `"1.5"`, `"-3"`, `"1e3"`) to `Number`. Non-string values and non-strict numeric strings (e.g., `"12abc"`, `"1,000"`) are left untouched. Mutates the input.

- **Parameters:**
  - `object` (Object): Object to coerce in place.
- **Returns:** The same `object`.

### coerceObjectIntegers(object)

Same as `coerceObjectNumbers` but only converts whole integer strings via `parseInt` (e.g., `"002"` → `2`, `"-7"` → `-7`). Mutates the input.

- **Parameters:**
  - `object` (Object): Object to coerce in place.
- **Returns:** The same `object`.

### findNodeByKey(key, node, pair = null)

Depth-first search through a nested object for the first node that owns `key`. If `pair` is provided, the node's value at `key` must equal `pair` (strict equality, supports falsy values like `false` / `0` / `""`).

- **Parameters:**
  - `key` (String): Property name to find.
  - `node` (Object): Tree to search.
  - `pair` (Any): Optional value constraint. `null` means "match any value".
- **Returns:** The matching node, or `null` if not found.

### waitForProperty(object, property, timeoutMs, interval = 100)

Polls `object` until it owns `property`, then resolves with the property's value. Rejects after `timeout` milliseconds.

- **Parameters:**
  - `object` (Object): Object to watch.
  - `property` (String): Property name to wait for.
  - `timeoutMs` (Number): Maximum wait time in milliseconds.
  - `interval` (Number): Poll interval in milliseconds.
- **Returns:** `Promise` resolving to the property's value.
- **Throws:** When the property does not appear within `timeoutMs`.

### shuffleObject(object)

Returns a new object whose entries are in random order (the underlying iteration order is the only thing being shuffled).

- **Parameters:**
  - `object` (Object): Source object.
- **Returns:** New object with the same keys/values in shuffled order.

### objectStringify(object)

Recursively walks an object and converts every leaf value to `String(value)`. Nested objects and arrays are descended into; mutates the input.

- **Parameters:**
  - `object` (Object): Object to mutate.
- **Returns:** The same `object`.

## Cookies

### cookiesFromResponse(response, decodeValues = false)

Parses the `Set-Cookie` headers off a response-like object (compatible with Node `http`, fetch responses, or anything with `headers["set-cookie"]`) and returns a flat `{name: value}` map via `set-cookie-parser`.

- **Parameters:**
  - `response` (Object): Response-like with parsed headers.
  - `decodeValues` (Boolean): Whether to URL-decode cookie values.
- **Returns:** Map of cookie name → value.

### cookiesToHeader(cookies)

Serializes a `{name: value}` map into a `Cookie:` header string (`name=value` pairs joined with `"; "`). Null/undefined values are dropped.

- **Parameters:**
  - `cookies` (Object): Map of cookie name → value.
- **Returns:** Cookie header string, or `""` for empty/missing input.

### cookiesFromHeader(header)

Parses a single `Cookie:` header string into a `{name: value}` map. Pieces without `=` are skipped; multiple `=` inside a value are preserved.

- **Parameters:**
  - `header` (String): Cookie header value.
- **Returns:** Map of cookie name → value. Empty input returns `{}`.

## HTTP Helpers

### isTransientHttpCode(httpCode)

Flags HTTP status codes that are typically transient or worth retrying (missing/`NaN`, `100`, `402`, `407`, `460-469`, anything `≥ 500`).

- **Parameters:**
  - `httpCode` (Number|null|undefined): Status code to inspect.
- **Returns:** `Boolean`.

### getResponseError(error, limit = 200)

Extracts a short error description from an HTTP error-like object. Prefers `error.response.status|error.response.data`, then `error.response.data`, then `error.message`. Truncates the result to `limit` characters via `limitString`.

- **Parameters:**
  - `error` (Error): Error from an HTTP client.
  - `limit` (Number): Maximum length of the returned string.
- **Returns:** Trimmed error description.

## Proxy Helpers

### normalizeProxy(proxy, protocol = "http")

Normalizes a wide range of proxy formats into a canonical `protocol://[user:pass@]host:port` URL. Supports:

- `host:port`
- `host:port:user:pass` (auth appended)
- `user:pass:host:port` (auth prepended; auto-detected via numeric port pattern)
- `host:portStart:portEnd:user:pass` (random port in range, inclusive)
- `user:pass:host:portStart:portEnd` (auth prepended, random port in range)
- `user:pass@host:port`
- `user:pass@host:portStart:portEnd` (random port in range)
- Any of the above prefixed with `scheme://` (`http`, `https`, `socks5`, `socks5h`, …)

Returns `null` for empty or non-string input. Does not crash on unparseable input — returns it as-is wrapped with `protocol://`.

- **Parameters:**
  - `proxy` (String): Source proxy string.
  - `protocol` (String): Default protocol when none is present in the input.
- **Returns:** Canonical proxy URL, or `null` when input is empty/missing.

### parseProxy(proxy, protocol = "http")

Normalizes `proxy` via `normalizeProxy`, then decomposes it into structured fields. Returns `null` when normalization fails (empty input).

- **Parameters:**
  - `proxy` (String): Source proxy string.
  - `protocol` (String): Default protocol when none is present in the input.
- **Returns:** `{protocol, host, port, auth?: {username, password}}` or `null`.

### proxyValue(rawProxy, replacements = {})

Picks a random proxy from a newline-separated list, normalizes it, and applies placeholder substitution.

`{SESSION}` is a built-in placeholder:

- If `SESSION` is not provided, it is autofilled with a non-secure `randomHex(8)`.
- If `SESSION` is a string, it is treated as a seed and replaced via `seedHex(seed, 8)` (deterministic).
- If `SESSION` is a function, the function is called per invocation.

Any other key in `replacements` is also substituted (`{KEY}` → value). For non-SESSION entries: functions are called, strings are used literally.

- **Parameters:**
  - `rawProxy` (String): Newline-separated proxy list.
  - `replacements` (Object): Placeholder values keyed by placeholder name.
- **Returns:** Final proxy URL string, or `null` if the list is empty.
