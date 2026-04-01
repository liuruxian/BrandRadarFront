import fs from 'node:fs';
import path from 'node:path';

const BACKEND_OPENAPI_PATH = 'C:/Users/admin/Desktop/git/crawler/HP/crawler_framework/api_schema.json';
const FRONT_OPENAPI_PATH = path.resolve('./api_schema.json');

if (!fs.existsSync(BACKEND_OPENAPI_PATH)) {
  console.error(`[sync-api] backend openapi not found: ${BACKEND_OPENAPI_PATH}`);
  process.exit(1);
}

fs.copyFileSync(BACKEND_OPENAPI_PATH, FRONT_OPENAPI_PATH);
console.log(`[sync-api] copied -> ${FRONT_OPENAPI_PATH}`);
