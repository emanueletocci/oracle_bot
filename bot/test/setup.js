// Runs before every test file: points ORACLE_DATA_DIR at a throwaway folder so
// the tests never touch the real database. This must happen before any module
// that imports paths.js (and therefore reads the env var) is loaded.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oracle-test-"));
process.env.ORACLE_DATA_DIR = tmp;
