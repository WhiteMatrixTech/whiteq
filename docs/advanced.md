# 进阶使用

## 处理任务进度

### 1. 定义任务处理器

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

const worker = wq.worker('queue1', async (job) => {
  // 异步处理任务
  // 更新任务进度
  await job.updateProgress(50);
  // 继续处理任务

  // 任务成功返回值
  return { result: 'success' };
});
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
