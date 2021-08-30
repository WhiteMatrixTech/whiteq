import { WhiteQ } from '../src';

let wq: WhiteQ;

describe('Unit Tests', () => {
  beforeAll(() => {
    wq = new WhiteQ({
      connection: {
        host: process.env.REDIS_HOST || 'localhost'
      }
    });
    expect(wq).toBeDefined();
  });

  it('addJob', async () => {
    const job = await wq.addJob('queue', 'job', { str: 'any' }, { lifo: true });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(job.data?.str).toEqual('any');
  });

  afterAll(async () => {
    await wq.disconnect();
  });
});
