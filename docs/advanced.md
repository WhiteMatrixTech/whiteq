# 进阶使用

## 处理任务进度

### 1. 定义任务处理器

```ts
import { WhiteQ } from 'whiteq';

const wq = new WhiteQ({
  connection: {
    host: process.env.REDIS_URL || 'localhost',
    port: 6379
  }
  // 不添加任务的话，可以不设置默认任务配置
});

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
      // 频率限制: 每秒中最多 10 次
      max: 10,
      duration: 1000,
      groupKey: 'customerId'
    }
  }
);
```

### 2. 定义监听事件

#### 可以直接在 Worker 上绑定侦听事件

```ts
worker.on('progress', (job, progress) => {
  console.log('Progress on worker:', job.id, progress);
});
```

#### 也可以在其他项目中侦听该队列任务事件

```ts
const event = wq.event('queue1');
event.on('progress', (job) => {
  console.log('Progress on event queue:', job);
});
```

### 3. 创建普通任务

创建普通任务的步骤不限制于任何位置（项目），一次性完成。

```ts
import { WhiteQ } from 'whiteq';

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

// 创建任务
await wq.addJob(
  'queue1',
  'progressTask',
  { data: 'test' },
  {
    lifo: true
  }
);
```

项目示例代码位于： <https://github.com/WhiteMatrixTech/whiteq/blob/main/examples/progress/index.js>

## 计划任务

建议计划任务的定义及处理器放在同一项目下。

示例代码：

```ts
import { WhiteQ } from 'whiteq';

const wq = new WhiteQ({
  connection: {
    host: process.env.REDIS_URL || 'localhost',
    port: 6379
  }
});

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
```

项目示例代码位于： <https://github.com/WhiteMatrixTech/whiteq/blob/main/examples/cron/index.js>
