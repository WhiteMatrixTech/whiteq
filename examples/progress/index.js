const { WhiteQ } = require('../../dist');

const wq = new WhiteQ({
  connection: {
    host: process.env.REDIS_URL || 'localhost',
    port: 6379
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    limiter: {
      groupKey: 'customerId'
    }
  }
});

async function main() {
  // 可以在项目 A 中 添加任务
  await wq.addJob(
    'queue1',
    'progressTask',
    { data: 'test' },
    {
      lifo: true
    }
  );

  // 可以在项目 B 中 添加处理器
  const worker = wq.worker(
    'queue1',
    async (job) => {
      // 异步处理任务
      // 更新任务进度
      await job.updateProgress(50);
      // 继续处理任务

      // 任务成功返回值
      return { result: 'success' };
    },
    {
      limiter: {
        max: 10,
        duration: 1000,
        groupKey: 'customerId'
      }
    }
  );

  // 可以在 worker 中监听
  worker.on('progress', (job, progress) => {
    console.log('Progress on worker:', job.id, progress);
  });
  worker.on('completed', (job, returnvalue) => {
    console.log(returnvalue);
  });

  // 也可以在任意项目中监听
  const event = wq.event('queue1');
  event.on('progress', (job) => {
    console.log('Progress on event queue:', job);
  });
}

main().then(() => {
  console.log('Done.');
});
