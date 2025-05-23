# Node.js Functions

This document provides information about the Node.js specific functions available in the node module (`melperjs/node`).

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

### executeCommand(command)

Executes a shell command and returns the result.

- **Parameters:**
  - `command` (String): Shell command to execute
- **Returns:** Promise that resolves with command output

### serverIp()

Gets the server's external IP address.

- **Returns:** IP address string

### getVersion()

Gets a version string based on git commit date.

- **Returns:** Version string in format "YYMMDD.HHMM"

### createNumDir(mainDirectory, start = 0, end = 9)

Creates a main directory with numbered subdirectories.

- **Parameters:**
  - `mainDirectory` (String): Path to the main directory
  - `start` (Number): First directory number to create (default: 0)
  - `end` (Number): Last directory number to create (default: 9)
- **Returns:** void

### readJsonFile(filePath)

Reads and parses a JSON file asynchronously.

- **Parameters:**
  - `filePath` (String): Path to JSON file
- **Returns:** Promise that resolves with parsed JSON object

### readJsonFileSync(filePath)

Reads and parses a JSON file synchronously.

- **Parameters:**
  - `filePath` (String): Path to JSON file
- **Returns:** Parsed JSON object

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

Recursively removes all files and subdirectories from a directory.

- **Parameters:**
  - `directoryPath` (String): Path to directory
  - `keepDir` (Boolean): Whether to keep the main directory (default: true)
- **Returns:** Promise that resolves when directory is cleaned

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

### hashBcrypt(plainText, encryptionKey = "")

Creates a bcrypt hash of text with optional encryption key.

- **Parameters:**
  - `plainText` (String): Text to hash
  - `encryptionKey` (String): Additional encryption key (optional)
- **Returns:** Bcrypt hash string

### verifyBcrypt(plainText, hash, encryptionKey = "")

Verifies a plaintext against a bcrypt hash.

- **Parameters:**
  - `plainText` (String): Text to verify
  - `hash` (String): Bcrypt hash to compare against
  - `encryptionKey` (String): Additional encryption key (optional)
- **Returns:** Boolean indicating if the hash matches

### formatProxy(proxy, protocol = "http")

Formats and normalizes a proxy string.

- **Parameters:**
  - `proxy` (String): Proxy string to format
  - `protocol` (String): Default protocol to use (default: "http")
- **Returns:** Formatted proxy string

### proxyObject(...args)

Converts a proxy string to a structured object.

- **Parameters:**
  - Same as `formatProxy`
- **Returns:** Object with proxy components

### proxyValue(proxies)

Selects a random proxy from a list.

- **Parameters:**
  - `proxies` (String): Newline-separated list of proxies
- **Returns:** Formatted proxy string or null
