/* eslint-disable */
import Redis from 'ioredis';

export default async () => {
  const redis = new Redis(process.env.REDIS_URL);
  await redis.flushdb();
  redis.disconnect();
  console.log('Clear Done.');
};
