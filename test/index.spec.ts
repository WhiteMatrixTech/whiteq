import { WhiteQ } from '../src';

let wq: WhiteQ;

describe('Unit Tests', () => {
  beforeAll(() => {
    wq = new WhiteQ({
      connection: {
        host: process.env.REDIS_URL || 'localhost'
      }
    });
    expect(wq).toBeDefined();
  });

  it('default', async () => {
    try {
      const wq1 = new WhiteQ();
      expect(wq1).toBeDefined();
      await wq1.disconnect();
    } catch (e) {
      //
    }
  });

  it('addJob', async () => {
    const job = await wq.addJob('queue', 'job', { str: 'any' }, { lifo: true });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(job.data?.str).toEqual('any');
  });

  it('addJobs', async () => {
    const jobs = await wq.addJobs('queue', [
      {
        name: 'test',
        data: { str: 'any' }
      },
      {
        name: 'test',
        data: { str: 'any' }
      }
    ]);
    expect(jobs.length).toEqual(2);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(jobs[0].data?.str).toEqual('any');
  });

  it('worker', () => {
    wq.worker('test', (): Promise<any> => Promise.resolve(''));

    const worker = wq.worker('test');
    expect(worker).toBeDefined();
  });

  it('addFlowJobs', async () => {
    const jobs = await wq.addFlowJobs({
      name: 'flow',
      queueName: 'test',
      children: [
        { name: 'paint', data: { place: 'ceiling' }, queueName: 'steps' },
        { name: 'paint', data: { place: 'walls' }, queueName: 'steps' },
        { name: 'fix', data: { place: 'floor' }, queueName: 'steps' }
      ]
    });
    expect(jobs.job.name).toEqual('flow');
  });

  afterAll(async () => {
    await wq.disconnect();
  });
});
