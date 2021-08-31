import {
  ConnectionOptions,
  Queue,
  Worker,
  FlowProducer,
  QueueBaseOptions,
  QueueOptions,
  JobsOptions,
  Job,
  WorkerOptions,
  Processor,
  FlowJob,
  JobNode,
  FlowOpts,
  BulkJobOptions
} from 'bullmq';

export class WhiteQ<T = any, R = any, N extends string = string> {
  private queques: Map<string, Queue<T, R, N>> = new Map();

  private workers: Map<string, Worker<T, R, N>> = new Map();

  private flow: FlowProducer;

  constructor(private readonly opts?: QueueOptions) {
    const baseOpts: QueueBaseOptions = {
      connection: this.opts?.connection,
      prefix: this.opts?.prefix
    };
    this.flow = new FlowProducer(baseOpts);
  }

  public async disconnect(): Promise<void> {
    await Promise.all([...this.queques].map(([, queue]) => queue.disconnect()));
    await Promise.all([...this.workers].map(([, worker]) => worker.close()));
    await this.flow.disconnect();
    this.queques.clear();
    this.workers.clear();
  }

  public queue(queueName: string): Queue<T, R, N> {
    if (!this.queques.has(queueName)) {
      const q = new Queue<T, R, N>(queueName, this.opts);
      this.queques.set(queueName, q);
    }
    return this.queques.get(queueName) as Queue<T, R, N>;
  }

  public addJob(queueName: string, name: N, data: T, opts?: JobsOptions): Promise<Job<T, R, N>> {
    const q = this.queue(queueName);
    return q.add(name, data, opts);
  }

  public addJobs(
    queueName: string,
    jobs: {
      name: N;
      data: T;
      opts?: BulkJobOptions;
    }[]
  ): Promise<Job<T, any, N>[]> {
    const q = this.queue(queueName);
    return q.addBulk(jobs);
  }

  public worker(queueName: string, processor?: string | Processor<T, R, N>, opts?: WorkerOptions): Worker<T, R, N> {
    if (!this.workers.has(queueName)) {
      const w = new Worker<T, R, N>(queueName, processor, opts);
      this.workers.set(queueName, w);
    }
    return this.workers.get(queueName) as Worker<T, R, N>;
  }

  public addFlowJobs(flow: FlowJob, opts?: FlowOpts): Promise<JobNode> {
    return this.flow.add(flow, opts);
  }
}

export {
  ConnectionOptions,
  QueueOptions,
  JobsOptions,
  WorkerOptions,
  Processor,
  FlowJob,
  JobNode,
  FlowOpts,
  BulkJobOptions,
  Job
};
