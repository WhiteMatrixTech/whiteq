import { WhiteQ } from '../src';

describe('Unit Tests', () => {
  it('class WhiteQ', async () => {
    const wq = new WhiteQ();
    expect(wq).toBeDefined();
    await wq.disconnect();
  });
});
