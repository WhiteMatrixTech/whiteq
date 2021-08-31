# WhiteQ

## Installation

```bash
yarn add whiteq
```

## Usage

### 创建实例

```ts
new WhiteQ<T = any, R = any, N extends string = string>(opts: QueueOptions);
```

其中，类型定义：

- T： 任务的数据类型
- R： 任务处理器（Handler）的返回类型
- N： 名称的类型，非特殊情况下使用字符串即可

参数接口参考： [QueueOptions](interfaces.md#QueueOptions)

示例：

```ts
import { WhiteQ } from 'whiteq';

const wq = new WhiteQ({
  // 连接信息，可选
  connection: {
    host: process.env.REDIS_URL || 'localhost',
    port: 6379
  }
});
```

### 添加任务（消息）

```ts
wq.addJob(queueName: string, name: N, data: T, opts?: JobsOptions): Promise<Job<T, R, N>>;
```

参数：

- 队列名称
- 任务/消息名称
- 数据
- 任务参数，参考：[JobsOptions](interfaces.md#JobsOptions)

示例：

```ts
// 在 async 方法中
const job = await wq.addJob('queue', 'job', { str: 'any' }, { lifo: true });

// job.data.str === 'any'
```

### 群发任务(消息)

```ts
wq.addJobs(
  queueName: string,
  jobs: {
    name: N;
    data: T;
    opts?: BulkJobOptions;
  }[]
): Promise<Job<T, any, N>[]>;
```

参数：

- 队列名称
- 任务数组 []
  - 任务/消息名称
  - 数据
  - 任务参数，参考： [BulkJobOptions](interfaces.md#BulkJobOptions)

### 处理器

```ts
worker(queueName: string, processor?: string | Processor<T, R, N>, opts?: WorkerOptions): Worker<T, R, N>;
```

参考： [Processor](interfaces.md#Processor)

示例：

```ts
// 创建一个处理器函数
wq.worker('test', (): Promise<any> => Promise.resolve(''));

// 获取一个处理器实例
const worker = wq.worker('test');
```

### 队列

```ts
wq.queue(queueName: string): Queue<T, R, N>;
```

### 添加流水线任务

```ts
wq.addFlowJobs(flow: FlowJob, opts?: FlowOpts): Promise<JobNode>;
```

参数：

- 流水线任务，参考： [FlowJob](interfaces.md#FlowJob)
- 任务配置，参考： [FlowOpts](interfaces.md#FlowOpts)

## 进阶使用

参考：[Advanced](advanced.md)

### 事件监听

#### 1. 任务事件

```ts
const e = wq.event('Paint');

e.on('completed', (jobId: string) => {
  // Called every time a job is completed in any worker.
});

e.on('progress', ({ jobId, data }: { jobId: string; data: number | object })) => {
  // jobId received a progress event
});
```

包括事件的类型：

- active
- removed
- waiting-children
- added
- completed
- delayed
- drained
- progress
- waiting
- stalled
- failed

#### 2. 处理器事件

```ts
const w = wq.worker('Paint');

w.on('progress', (job: Job, progress: number | object) => void);
```

包括事件的类型：

- completed
- drained
- error
- failed
- progress

#### 3. 队列事件

```ts
const q = wq.queue('Paint');

q.on('cleaned', (jobs: string[], type: string) => void);
```

### 计划任务

```ts
// 将队列设置为计划任务队列
wq.scheduler('queue2');

// 添加计划任务
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

// 任务处理器无特殊之处
```

### 关闭所有连接

```ts
await wq.disconnect();
```
