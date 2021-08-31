# Interfaces

## WhiteQ

```typescript
class WhiteQ<T = any, R = any, N extends string = string> {
  constructor(opts?: QueueOptions);
  disconnect(): Promise<void>;
  queue(queueName: string): Queue<T, R, N>;
  addJob(queueName: string, name: N, data: T, opts?: JobsOptions): Promise<Job<T, R, N>>;
  addJobs(
    queueName: string,
    jobs: {
      name: N;
      data: T;
      opts?: BulkJobOptions;
    }[]
  ): Promise<Job<T, any, N>[]>;
  worker(queueName: string, processor?: string | Processor<T, R, N>, opts?: WorkerOptions): Worker<T, R, N>;
  addFlowJobs(flow: FlowJob, opts?: FlowOpts): Promise<JobNode>;
}
```

## ConnectionOptions

基本等同于 ioredis 的选项参数，或者直接传入实例 Client 或 Cluster。

```ts
import { Redis, RedisOptions as BaseRedisOptions, Cluster } from 'ioredis';
type RedisOptions = BaseRedisOptions & {
  skipVersionCheck?: boolean;
};
type ConnectionOptions = RedisOptions | Redis | Cluster;
```

## QueueOptions

```ts
/**
 * Options for the Queue class.
 */
interface QueueOptions extends QueueBaseOptions {
  defaultJobOptions?: JobsOptions;
  /**
   * Options for the rate limiter.
   */
  limiter?: {
    /**
     * Group key to be used by the limiter when
     * limiting by group keys.
     */
    groupKey: string;
  };
  /**
   * Options for the streams used internally in BullMQ.
   */
  streams?: {
    /**
     * Options for the events stream.
     */
    events: {
      /**
       * Max approximated length for streams. Default is 10 000 events.
       */
      maxLen: number;
    };
  };
}
```

### QueueBaseOptions

未抛出。

```ts
/**
 * Base Queue options
 */
interface QueueBaseOptions {
  connection?: ConnectionOptions;
  /**
   * Prefix for all queue keys.
   */
  prefix?: string;
}
```

## JobsOptions

```ts
interface JobsOptions {
  /**
   * Timestamp when the job was created. Defaults to `Date.now()`.
   */
  timestamp?: number;
  /**
   * Ranges from 1 (highest priority) to MAX_INT (lowest priority). Note that
   * using priorities has a slight impact on performance,
   * so do not use it if not required.
   */
  priority?: number;
  /**
   * An amount of milliseconds to wait until this job can be processed.
   * Note that for accurate delays, worker and producers
   * should have their clocks synchronized.
   */
  delay?: number;
  /**
   * The total number of attempts to try the job until it completes.
   */
  attempts?: number;
  /**
   * Repeat this job, for example based on a `cron` schedule.
   */
  repeat?: RepeatOptions;
  /**
   * Rate limiter key to use if rate limiter enabled.
   *
   * @see {@link https://docs.bullmq.io/guide/rate-limiting}
   */
  rateLimiterKey?: string;
  /**
   * Backoff setting for automatic retries if the job fails
   */
  backoff?: number | BackoffOptions;
  /**
   * If true, adds the job to the right of the queue instead of the left (default false)
   *
   * @see {@link https://docs.bullmq.io/guide/jobs/lifo}
   */
  lifo?: boolean;
  /**
   * The number of milliseconds after which the job should be
   * fail with a timeout error.
   */
  timeout?: number;
  /**
   * Override the job ID - by default, the job ID is a unique
   * integer, but you can use this setting to override it.
   * If you use this option, it is up to you to ensure the
   * jobId is unique. If you attempt to add a job with an id that
   * already exists, it will not be added.
   */
  jobId?: string;
  /**
   * If true, removes the job when it successfully completes
   * When given an number, it specifies the maximum amount of
   * jobs to keep.
   * Default behavior is to keep the job in the completed set.
   */
  removeOnComplete?: boolean | number;
  /**
   * If true, removes the job when it fails after all attempts.
   * When given an number, it specifies the maximum amount of
   * jobs to keep.
   */
  removeOnFail?: boolean | number;
  /**
   * Limits the amount of stack trace lines that will be recorded in the stacktrace.
   */
  stackTraceLimit?: number;
  /**
   *
   */
  parent?: {
    id: string;
    queue: string;
  };
  /**
   * Internal property used by repeatable jobs.
   */
  prevMillis?: number;
  /**
   * Limits the size in bytes of the job's data payload (as a JSON serialized string).
   */
  sizeLimit?: number;
}
```

### RepeatOptions

未抛出。

```ts
/**
 * Settings for repeatable jobs
 *
 * @see {@link https://docs.bullmq.io/guide/jobs/repeatable}
 */
export interface RepeatOptions {
  /**
   * A cron pattern
   */
  cron?: string;
  /**
   * Timezone
   */
  tz?: string;
  /**
   * Start date when the repeat job should start repeating (only with `cron`).
   */
  startDate?: Date | string | number;
  /**
   * End date when the repeat job should stop repeating.
   */
  endDate?: Date | string | number;
  /**
   * Number of times the job should repeat at max.
   */
  limit?: number;
  /**
   * Repeat after this amount of milliseconds
   * (`cron` setting cannot be used together with this setting.)
   */
  every?: number;
  /**
   * Repeated job should start right now
   * ( work only with every settings)
   */
  immediately?: boolean;
  /**
   * The start value for the repeat iteration count.
   */
  count?: number;
  prevMillis?: number;
  offset?: number;
  jobId?: string;
}
```

### BackoffOptions

未抛出。

```ts
/**
 * Settings for backing off failed jobs.
 *
 * @see {@link https://docs.bullmq.io/guide/retrying-failing-jobs}
 */
export interface BackoffOptions {
  /**
   * Name of the backoff strategy.
   */
  type: string;
  /**
   * Delay in milliseconds.
   */
  delay?: number;
}
```

## BulkJobOptions

```ts
type BulkJobOptions = Omit<JobsOptions, 'repeat'>;
```

参考上文 JobsOptions

## WorkerOptions

```ts
interface WorkerOptions extends QueueBaseOptions {
  /**
   * Amount of jobs that a single worker is allowed to work on
   * in parallel.
   *
   * @see {@link https://docs.bullmq.io/guide/workers/concurrency}
   */
  concurrency?: number;
  /**
   * @see {@link https://docs.bullmq.io/guide/rate-limiting}
   */
  limiter?: RateLimiterOptions;
  skipDelayCheck?: boolean;
  drainDelay?: number;
  lockDuration?: number;
  lockRenewTime?: number;
  runRetryDelay?: number;
  settings?: AdvancedOptions;
}
```

### RateLimiterOptions

未抛出。

```ts
export interface RateLimiterOptions {
  /**
   * Max number of jobs to process in the time period
   * specified in `duration`.
   */
  max: number;
  /**
   * Time in milliseconds. During this time, a maximum
   * of `max` jobs will be processed.
   */
  duration: number;
  /**
   * It is possible to define a rate limiter based on group keys,
   * for example you may want to have a rate limiter per customer
   * instead of a global rate limiter for all customers
   *
   * @see {@link https://docs.bullmq.io/guide/rate-limiting}
   */
  groupKey?: string;
  /**
   * This option enables a heuristic so that when a queue is heavily
   * rete limited, it delays the workers so that they do not try
   * to pick jobs when there is no point in doing so.
   * Note: It is not recommended to use this option when using
   * groupKeys unless you have a big amount of workers since
   * you may be delaying workers that could pick jobs in groups that
   * have not been rate limited.
   */
  workerDelay?: boolean;
}
```

### AdvancedOptions

未抛出。

```ts
interface AdvancedOptions {
  /**
   * A set of custom backoff strategies keyed by name.
   */
  backoffStrategies?: {};
}
```

## Processor

```ts
type Processor<T = any, R = any, N extends string = string> = (job: Job<T, R, N>, token?: string) => Promise<R>;
```

## FlowJob

```ts
interface FlowJob {
  name: string;
  queueName: string;
  data?: any;
  prefix?: string;
  opts?: Omit<JobsOptions, 'parent'>;
  children?: FlowJob[];
}
```

## JobNode

```ts
interface JobNode {
  job: Job;
  children?: JobNode[];
}
```

## FlowOpts

```ts
type FlowQueuesOpts = Record<string, Omit<QueueOptions, 'connection' | 'prefix'>>;
interface FlowOpts {
  queuesOptions: FlowQueuesOpts;
}
```

## Job

```ts
class Job<T = any, R = any, N extends string = string> {
  private queue;
  /**
   * The name of the Job
   */
  name: N;
  /**
   * The payload for this job.
   */
  data: T;
  /**
   * The options object for this job.
   */
  opts: JobsOptions;
  id?: string;
  /**
   * The progress a job has performed so far.
   */
  progress: number | object;
  /**
   * The value returned by the processor when processing this job.
   */
  returnvalue: R;
  /**
   * Stacktrace for the error (for failed jobs).
   */
  stacktrace: string[];
  /**
   * Timestamp when the job was created (unless overridden with job options).
   */
  timestamp: number;
  /**
   * Number of attempts after the job has failed.
   */
  attemptsMade: number;
  /**
   * Reason for failing.
   */
  failedReason: string;
  /**
   * Timestamp for when the job finished (completed or failed).
   */
  finishedOn?: number;
  /**
   * Timestamp for when the job was processed.
   */
  processedOn?: number;
  /**
   * Fully qualified key (including the queue prefix) pointing to the parent of this job.
   */
  parentKey?: string;
  private toKey;
  private discarded;
  constructor(
    queue: MinimalQueue,
    /**
     * The name of the Job
     */
    name: N,
    /**
     * The payload for this job.
     */
    data: T,
    /**
     * The options object for this job.
     */
    opts?: JobsOptions,
    id?: string
  );
  /**
   * Creates a new job and adds it to the queue.
   *
   * @param queue - the queue where to add the job.
   * @param name - the name of the job.
   * @param data - the payload of the job.
   * @param opts - the options bag for this job.
   * @returns
   */
  static create<T = any, R = any, N extends string = string>(
    queue: MinimalQueue,
    name: N,
    data: T,
    opts?: JobsOptions
  ): Promise<Job<T, R, N>>;
  /**
   * Creates a bulk of jobs and adds them atomically to the given queue.
   *
   * @param queue -the queue were to add the jobs.
   * @param jobs - an array of jobs to be added to the queue.
   * @returns
   */
  static createBulk<T = any, R = any, N extends string = string>(
    queue: MinimalQueue,
    jobs: {
      name: N;
      data: T;
      opts?: BulkJobOptions;
    }[]
  ): Promise<Job<T, R, N>[]>;
  /**
   * Instantiates a Job from a JobJsonRaw object (coming from a deserialized JSON object)
   *
   * @param queue - the queue where the job belongs to.
   * @param json - the plain object containing the job.
   * @param jobId - an optional job id (overrides the id coming from the JSON object)
   * @returns
   */
  static fromJSON(queue: MinimalQueue, json: JobJsonRaw, jobId?: string): Job<any, any, string>;
  /**
   * Fetches a Job from the queue given the passed job id.
   *
   * @param queue - the queue where the job belongs to.
   * @param jobId - the job id.
   * @returns
   */
  static fromId(queue: MinimalQueue, jobId: string): Promise<Job | undefined>;
  toJSON(): Pick<this, Exclude<keyof this, 'queue'>>;
  /**
   * Prepares a job to be serialized for storage in Redis.
   * @returns
   */
  asJSON(): JobJson;
  /**
   * Updates a job's data
   *
   * @param data - the data that will replace the current jobs data.
   */
  update(data: T): Promise<void>;
  /**
   * Updates a job's progress
   *
   * @param progress - number or object to be saved as progress.
   */
  updateProgress(progress: number | object): Promise<void>;
  /**
   * Logs one row of log data.
   *
   * @param logRow - string with log data to be logged.
   */
  log(logRow: string): Promise<number>;
  /**
   * Completely remove the job from the queue.
   * Note, this call will throw an exception if the job
   * is being processed when the call is performed.
   */
  remove(): Promise<void>;
  /**
   * Extend the lock for this job.
   *
   * @param token - unique token for the lock
   * @param duration - lock duration in milliseconds
   */
  extendLock(token: string, duration: number): Promise<any>;
  /**
   * Moves a job to the completed queue.
   * Returned job to be used with Queue.prototype.nextJobFromJobData.
   *
   * @param returnValue - The jobs success message.
   * @param fetchNext - True when wanting to fetch the next job
   * @returns Returns the jobData of the next job in the waiting queue.
   */
  moveToCompleted(returnValue: R, token: string, fetchNext?: boolean): Promise<[JobJsonRaw, string] | []>;
  /**
   * Moves a job to the failed queue.
   *
   * @param err - the jobs error message.
   * @param token - token to check job is locked by current worker
   * @param fetchNext - true when wanting to fetch the next job
   * @returns void
   */
  moveToFailed(err: Error, token: string, fetchNext?: boolean): Promise<void>;
  /**
   * @returns true if the job has completed.
   */
  isCompleted(): Promise<boolean>;
  /**
   * @returns true if the job has failed.
   */
  isFailed(): Promise<boolean>;
  /**
   * @returns true if the job is delayed.
   */
  isDelayed(): Promise<boolean>;
  /**
   * @returns true if the job is waiting for children.
   */
  isWaitingChildren(): Promise<boolean>;
  /**
   * @returns true of the job is active.
   */
  isActive(): Promise<boolean>;
  /**
   * @returns true if the job is waiting.
   */
  isWaiting(): Promise<boolean>;
  get queueName(): string;
  /**
   * Get current state.
   *
   * @returns Returns one of these values:
   * 'completed', 'failed', 'delayed', 'active', 'waiting', 'waiting-children', 'unknown'.
   */
  getState(): Promise<string>;
  /**
   * Change delay of a delayed job.
   *
   * @returns
   */
  changeDelay(delay: number): Promise<void>;
  /**
   * Get this jobs children result values if any.
   *
   * @returns Object mapping children job keys with their values.
   */
  getChildrenValues<CT = any>(): Promise<{
    [jobKey: string]: CT;
  }>;
  /**
   * Get children job keys if this job is a parent and has children.
   *
   * @returns dependencies separated by processed and unprocessed.
   */
  getDependencies(opts?: DependenciesOpts): Promise<{
    nextProcessedCursor?: number;
    processed?: Record<string, any>;
    nextUnprocessedCursor?: number;
    unprocessed?: string[];
  }>;
  /**
   * Get children job counts if this job is a parent and has children.
   *
   * @returns dependencies count separated by processed and unprocessed.
   */
  getDependenciesCount(opts?: { processed?: boolean; unprocessed?: boolean }): Promise<{
    processed?: number;
    unprocessed?: number;
  }>;
  /**
   * Returns a promise the resolves when the job has finished. (completed or failed).
   */
  waitUntilFinished(queueEvents: QueueEvents, ttl?: number): Promise<R>;
  /**
   * Moves the job to the delay set.
   *
   * @param timestamp - timestamp where the job should be moved back to "wait"
   * @returns
   */
  moveToDelayed(timestamp: number): Promise<void>;
  /**
   * Moves the job to the waiting-children set.
   *
   * @param token - Token to check job is locked by current worker
   * @param opts - The options bag for moving a job to waiting-children.
   * @returns true if the job was moved
   */
  moveToWaitingChildren(token: string, opts?: MoveToChildrenOpts): Promise<boolean | Error>;
  /**
   * Promotes a delayed job so that it starts to be processed as soon as possible.
   */
  promote(): Promise<void>;
  /**
   * Attempts to retry the job. Only a job that has failed can be retried.
   *
   * @returns If resolved and return code is 1, then the queue emits a waiting event
   * otherwise the operation was not a success and throw the corresponding error. If the promise
   * rejects, it indicates that the script failed to execute
   */
  retry(state?: 'completed' | 'failed'): Promise<void>;
  /**
   * Marks a job to not be retried if it fails (even if attempts has been configured)
   */
  discard(): void;
  private isInZSet;
  private isInList;
  /**
   * Adds the job to Redis.
   *
   * @param client -
   * @param parentOpts -
   * @returns
   */
  addJob(client: RedisClient, parentOpts?: ParentOpts): Promise<string>;
  private saveAttempt;
}
```
