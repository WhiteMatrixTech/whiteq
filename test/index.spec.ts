import { WhiteQ } from '../src';

describe('Unit Tests', () => {
  it('class WhiteQ', async () => {
    const wq = new WhiteQ({
      connection: {
        host: process.env.REDIS_HOST || 'localhost'
      }
    });
    expect(wq).toBeDefined();
    await wq.disconnect();
  });
});
