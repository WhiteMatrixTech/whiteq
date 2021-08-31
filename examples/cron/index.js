const { WhiteQ } = require('../../dist');

const wq = new WhiteQ({
  connection: {
    host: process.env.REDIS_URL || 'localhost',
    port: 6379
  }
});

async function main() {
  wq.scheduler('queue2');

  await wq.addJob(
    'queue2',
    'cronJob',
    {
      data: 'test'
    },
    {
      repeat: {
        every: 1e4 // every 1s
        // or
        // cron: '* 15 3 * * *'
      }
    }
  );

  wq.worker(
    'queue2',
    async (job) => {
      console.log(job.id);
      return 'success';
    },
    {
      concurrency: 10
    }
  );
}

main().then(() => {
  console.log('Done.');
});
