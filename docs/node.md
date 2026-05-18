# Node.js Functions

This document provides information about the Node.js specific functions available in the node module (`melperjs/node`).

### tokenBoolean()

Generates a cryptographically secure random boolean.

- **Returns:** Random boolean value

### tokenString(length, useNumbers = true, useUppercase = false)

Generates a cryptographically secure random string.

- **Parameters:**
  - `length` (Number): Length of the string to generate
  - `useNumbers` (Boolean): Include numbers (default: true)
  - `useUppercase` (Boolean): Include uppercase letters (default: false)
- **Returns:** Secure random string

### tokenHex(length)

Generates a cryptographically secure random hexadecimal string.

- **Parameters:**
  - `length` (Number): Length of the string to generate
- **Returns:** Secure random hex string

### tokenInteger(min, max)

Generates a cryptographically secure random integer between min and max.

- **Parameters:**
  - `min` (Number): Minimum value (inclusive)
  - `max` (Number): Maximum value (exclusive)
- **Returns:** Secure random integer

### tokenUuid(useDashes = true)

Generates a cryptographically secure random UUID.

- **Parameters:**
  - `useDashes` (Boolean): Whether to include dashes (default: true)
- **Returns:** Secure UUID string

### tokenWeighted(dict)

Returns a cryptographically secure random key based on weighted probabilities.

- **Parameters:**
  - `dict` (Object): Object with keys and their weights
- **Returns:** Selected key

### tokenElement(obj)

Returns a cryptographically secure random element from an array or object.

- **Parameters:**
  - `obj` (Array|Object): Collection to select from
- **Returns:** Random element

### seedUuid(seed)

Generates a deterministic UUID v4 from a seed string using MD5 hashing.

- **Parameters:**
  - `seed` (String): Seed value to generate UUID from
- **Returns:** UUID string with dashes

### executeCommand(command)

Executes a shell command and returns the result.

- **Parameters:**
  - `command` (String): Shell command to execute
- **Returns:** Promise that resolves with command output

### serverIp()

Returns the first non-loopback, non-internal IPv4 address from the host's network interfaces, skipping `127.0.0.1` and any address starting with `192.168.`. Falls back to `127.0.0.1` when no matching interface is found.

- **Returns:** IPv4 address string

### getVersion()

Builds a version string from the UTC timestamp of the latest git commit (`git show -s --format=%ct HEAD`).

- **Returns:** Version string in `YYMMDD.HHMM` format, or `"1.0"` when git is unavailable or the timestamp can't be parsed

### createNumDir(mainDirectory, start = 0, end = 9)

Creates a main directory with numbered subdirectories.

- **Parameters:**
  - `mainDirectory` (String): Path to the main directory
  - `start` (Number): First directory number to create (default: 0)
  - `end` (Number): Last directory number to create (default: 9)
- **Returns:** void

### readJsonFile(filePath, defaultValue = {})

Reads and parses a JSON file asynchronously.

- **Parameters:**
  - `filePath` (String): Path to JSON file
  - `defaultValue` (Any): Value to return if file cannot be read (default: `{}`)
- **Returns:** Promise that resolves with parsed JSON object or default value

### readJsonFileSync(filePath, defaultValue = {})

Reads and parses a JSON file synchronously.

- **Parameters:**
  - `filePath` (String): Path to JSON file
  - `defaultValue` (Any): Value to return if file cannot be read (default: `{}`)
- **Returns:** Parsed JSON object or default value

### writeJsonFile(filePath, data)

Writes data to a JSON file asynchronously.

- **Parameters:**
  - `filePath` (String): Path to JSON file
  - `data` (Object): Data to write
- **Returns:** Promise that resolves when file is written

### writeJsonFileSync(filePath, data)

Writes data to a JSON file synchronously.

- **Parameters:**
  - `filePath` (String): Path to JSON file
  - `data` (Object): Data to write
- **Returns:** void

### cleanDirectory(directoryPath, keepDir = true)

Recursively removes all files and subdirectories from a directory. When the directory does not exist and `keepDir = true`, it is created (the function does **not** create it when `keepDir = false`).

- **Parameters:**
  - `directoryPath` (String): Path to directory
  - `keepDir` (Boolean): Whether to keep the root directory itself (default: true)
- **Returns:** Promise that resolves when directory is cleaned (resolves to `true` when the directory existed, `undefined` when it was created from scratch)

### hash(algorithm, data)

Creates a hash using the specified algorithm.

- **Parameters:**
  - `algorithm` (String): Hash algorithm to use
  - `data` (String): Data to hash
- **Returns:** Hex string of hash

### md5(data)

Creates an MD5 hash of data.

- **Parameters:**
  - `data` (String): Data to hash
- **Returns:** Hex string of MD5 hash

### sha256(data)

Creates a SHA-256 hash of data.

- **Parameters:**
  - `data` (String): Data to hash
- **Returns:** Hex string of SHA-256 hash

### base64Encode(data)

Encodes data to Base64 string.

- **Parameters:**
  - `data` (String): Data to encode
- **Returns:** Base64 encoded string

### base64Decode(data, encoding = 'utf8')

Decodes a Base64 string.

- **Parameters:**
  - `data` (String): Base64 string to decode
  - `encoding` (String): Output encoding (default: 'utf8')
- **Returns:** Decoded string

### hashBcrypt(plainText, encryptionKey = "", rounds = 12)

Creates a bcrypt hash of text with optional encryption key.

- **Parameters:**
  - `plainText` (String): Text to hash
  - `encryptionKey` (String): Additional encryption key (default: "")
  - `rounds` (Number): Bcrypt salt rounds (default: 12)
- **Returns:** Bcrypt hash string

### verifyBcrypt(plainText, hash, encryptionKey = "")

Verifies a plaintext against a bcrypt hash.

- **Parameters:**
  - `plainText` (String): Text to verify
  - `hash` (String): Bcrypt hash to compare against
  - `encryptionKey` (String): Additional encryption key (optional)
- **Returns:** Boolean indicating if the hash matches

### formatProxy(proxy, protocol = "http")

Normalizes a proxy string into `protocol://[user:pass@]host:port` form.

Accepted input shapes:
- `host:port`
- `host:port:user:pass` (reordered to `user:pass@host:port`)
- `host:portStart:portEnd[:user:pass]` — picks a cryptographically random port in `[portStart, portEnd]` (inclusive)
- `user:pass@host:port` (left untouched apart from the protocol prefix)
- Any of the above prefixed with `scheme://` — the scheme overrides the `protocol` parameter

- **Parameters:**
  - `proxy` (String): Proxy string to format
  - `protocol` (String): Default protocol when the input has no `scheme://` prefix (default: `"http"`)
- **Returns:** Formatted proxy string

### proxyObject(...args)

Converts a proxy string to a structured object.

- **Parameters:**
  - Same as `formatProxy`
- **Returns:** Object with proxy components

### proxyValue(proxies)

Picks a cryptographically random proxy from a newline-separated list, runs it through `formatProxy`, and replaces any `{SESSION}` placeholder in the result with a random 8-char hex token (`tokenHex(8)`). Useful for sticky-session proxy pools where the username encodes a session id.

- **Parameters:**
  - `proxies` (String): Newline-separated list of proxies (blank lines are skipped via `splitClear`)
- **Returns:** Formatted proxy string with `{SESSION}` resolved, or `null` when the list is empty
