# General Functions

This document provides information about the general utility functions available in the core module (`melperjs`).

The library provides the following constants:

- `CONSTANTS.LOWER_CASE`: Contains lowercase letters (a-z)
- `CONSTANTS.UPPER_CASE`: Contains uppercase letters (A-Z)
- `CONSTANTS.HEXADECIMAL`: Contains hexadecimal characters (0-9, a-f)
- `CONSTANTS.NUMBERS`: Contains numeric characters (0-9)

### Exception(message, response = {}, name = null)

Creates a custom error with additional properties.

- **Parameters:**
  - `message` (String): Error message
  - `response` (Object): Response object (default: `{}`)
  - `name` (String): Error name (default: `"Exception"`)
- **Returns:** Error object with custom properties

### forever(cooldown, onSuccess, onError = null, onCompleted = null)

Runs a function repeatedly with a cooldown period between executions.

- **Parameters:**
  - `cooldown` (Number): Milliseconds to wait between executions
  - `onSuccess` (Function): Function to execute in the loop
  - `onError` (Function): Error handler function (optional)
  - `onCompleted` (Function): Function to run after each iteration (optional)
- **Returns:** Promise that never resolves (runs forever)

### sleepMs(milliseconds)

Pauses execution for specified milliseconds.

- **Parameters:**
  - `milliseconds` (Number): Time to wait in milliseconds
- **Returns:** Promise that resolves after the specified time

### sleep(seconds)

Pauses execution for specified seconds.

- **Parameters:**
  - `seconds` (Number): Time to wait in seconds
- **Returns:** Promise that resolves after the specified time

### promiseTimeout(milliseconds, promise)

Adds a timeout to a promise.

- **Parameters:**
  - `milliseconds` (Number): Maximum time to wait
  - `promise` (Promise): Promise to execute with timeout
- **Returns:** Promise that resolves with the original promise result or rejects with a timeout error

### promiseSilent(promise)

Executes a promise, ignoring any success or error result.

- **Parameters:**
  - `promise` (Promise): Promise to execute silently
- **Returns:** Promise that always resolves with no value

### retryFn(fn, retries, errorFn = null)

Retries a function multiple times until it succeeds or reaches the retry limit.

- **Parameters:**
  - `fn` (Function): Async function to execute
  - `retries` (Number): Maximum number of retry attempts
  - `errorFn` (Function): Called when an attempt fails (optional)
- **Returns:** Result of the successful function execution

### time()

Gets the current Unix timestamp (seconds since epoch).

- **Returns:** Current timestamp in seconds

### splitClear(rawText, separator = null)

Splits a string and removes empty items.

- **Parameters:**
  - `rawText` (String): String to split
  - `separator` (String|RegExp): Separator to use (default: newline)
- **Returns:** Array of non-empty trimmed strings

### pascalCase(str)

Converts a string to PascalCase.

- **Parameters:**
  - `str` (String): String to convert
- **Returns:** String in PascalCase format

### titleCase(str, separator = " ")

Converts a string to Title Case.

- **Parameters:**
  - `str` (String): String to convert
  - `separator` (String): Word separator (default: space)
- **Returns:** String with each word capitalized

### limitString(str, limit = 35, omission = "...")

Truncates a string to a specified length.

- **Parameters:**
  - `str` (String): String to truncate
  - `limit` (Number): Maximum length (default: 35)
  - `omission` (String): String to append (default: "...")
- **Returns:** Truncated string

### safeString(str)

Sanitizes a string by removing potential XSS content.

- **Parameters:**
  - `str` (String): String to sanitize
- **Returns:** Sanitized string

### shuffleString(str)

Randomly shuffles the characters in a string.

- **Parameters:**
  - `str` (String): String to shuffle
- **Returns:** Shuffled string

### randomString(length, useNumbers = true, useUppercase = false)

Generates a random string.

- **Parameters:**
  - `length` (Number): Length of the string to generate
  - `useNumbers` (Boolean): Include numbers (default: true)
  - `useUppercase` (Boolean): Include uppercase letters (default: false)
- **Returns:** Random string

### randomHex(length)

Generates a random hexadecimal string.

- **Parameters:**
  - `length` (Number): Length of the string to generate
- **Returns:** Random hex string

### randomInteger(min, max, callback)

Generates a random integer between min and max.

- **Parameters:**
  - `min` (Number): Minimum value (inclusive)
  - `max` (Number): Maximum value (exclusive)
  - `callback` (Function): Optional callback to receive the result
- **Returns:** Random integer or calls callback with result

### randomUuid(useDashes = true)

Generates a random UUID.

- **Parameters:**
  - `useDashes` (Boolean): Whether to include dashes (default: true)
- **Returns:** UUID string

### randomWeighted(dict, randomFunc = null)

Returns a random key based on weighted probabilities.

- **Parameters:**
  - `dict` (Object): Object with keys and their weights
  - `randomFunc` (Function): Custom random function (optional)
- **Returns:** Selected key

### randomElement(obj)

Returns a random element from an array or object.

- **Parameters:**
  - `obj` (Array|Object): Collection to select from
- **Returns:** Random element

### indexByTime(index)

Returns an index value modified based on current hour and minute.

- **Parameters:**
  - `index` (Number): Base index value
- **Returns:** Modified index value (0-9)

### findKeyNode(key, node, pair = null)

Recursively searches for a key in an object tree.

- **Parameters:**
  - `key` (String): Key to find
  - `node` (Object): Object to search in
  - `pair` (Any): Optional value to match with the key
- **Returns:** Node containing the key or null

### checkEmpty(value)

Checks if a value is empty (including zero for numbers).

- **Parameters:**
  - `value` (Any): Value to check
- **Returns:** Boolean indicating if value is empty

### parseNumFromObj(obj)

Converts string numbers to actual numbers in an object.

- **Parameters:**
  - `obj` (Object): Object to process
- **Returns:** Processed object

### parseIntFromObj(obj)

Converts string integers to actual integers in an object.

- **Parameters:**
  - `obj` (Object): Object to process
- **Returns:** Processed object

### objectStringify(obj)

Converts all values in an object to strings.

- **Parameters:**
  - `obj` (Object): Object to convert
- **Returns:** Object with string values

### modifyObjectKeys(obj, callFn)

Transforms all keys in an object using a callback function.

- **Parameters:**
  - `obj` (Object): Object to transform
  - `callFn` (Function): Function to apply to each key
- **Returns:** New object with transformed keys

### isValidURL(url)

Checks if a string is a valid URL.

- **Parameters:**
  - `url` (String): URL to validate
- **Returns:** Boolean indicating URL validity

### cookieDict(res, decodeValues = false)

Converts response cookies to a object.

- **Parameters:**
  - `res` (Response): Response object with cookies
  - `decodeValues` (Boolean): Whether to decode cookie values
- **Returns:** Object with cookie name-value pairs

### cookieHeader(cookieDict)

Converts a cookie dictionary to a cookie header string.

- **Parameters:**
  - `cookieDict` (Object): Cookie name-value pairs
- **Returns:** Cookie header string

### isIntlHttpCode(httpCode)

Checks if an HTTP code is likely to be an internal issue.

- **Parameters:**
  - `httpCode` (Number): HTTP status code
- **Returns:** Boolean indicating if code is internal

### isIntlHttpError(e)

Checks if an HTTP error is likely to be an internal issue.

- **Parameters:**
  - `e` (Error): Error object
- **Returns:** Boolean indicating if error is internal
