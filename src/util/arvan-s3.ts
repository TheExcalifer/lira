import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();
export const arvanS3 = new S3Client({
  region: 'default',
  endpoint: 'https://s3.ir-thr-at1.arvanstorage.ir/',
  credentials: {
    accessKeyId: process.env.ARVAN_ACCESS_KEY_ID!,
    secretAccessKey: process.env.ARVAN_SECRET_ACCESS_KEY!,
  },
});