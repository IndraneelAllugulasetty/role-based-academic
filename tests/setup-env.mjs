import fs from 'fs';
import os from 'os';
import path from 'path';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'academic-api-test-'));
process.env.SQLITE_DB_PATH = path.join(dir, 'test.sqlite');
process.env.JWT_SECRET = 'vitest-jwt-secret';
