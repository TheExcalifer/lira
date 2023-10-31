import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: join(__dirname, '..', '..', '.env') });

export const arvanS3 = new S3Client({
  region: 'default',
  endpoint: 'https://s3.ir-thr-at1.arvanstorage.ir/',
  credentials: {
    accessKeyId: process.env.ARVAN_ACCESS_KEY_ID!,
    secretAccessKey: process.env.ARVAN_SECRET_ACCESS_KEY!,
  },
});
