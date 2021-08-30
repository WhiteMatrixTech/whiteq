import { Queue, Worker, FlowProducer, QueueBaseOptions } from 'bullmq';
import { QueueOptions, JobsOptions, Job, WorkerOptions, Processor, FlowJob, JobNode } from './types';

export class WhiteQ<T = any, R = any, N extends string = string> {
  private queques: Map<string, Queue> = new Map();

  private workers: Map<string, Worker> = new Map();

  private flow: FlowProducer;

  constructor(private readonly opts: QueueOptions) {}

  public queue(queueName: string): Queue {
    if (!this.queques.has(queueName)) {
      const q = new Queue<T, R, N>(queueName, this.opts);
      this.queques.set(queueName, q);
    }
    return this.queques.get(queueName) as Queue;
  }

  public addJob(queueName: string, name: string, data: T, opts: JobsOptions): Promise<Job<T, R, N>> {
    const q = this.queue(queueName);
    return q.add(name, data, opts);
  }

  public addJobs(
    queueName: string,
    jobs: {
      name: string;
      data: T;
      opts?: BulkJobOptions;
    }[]
  ): Promise<Job<T, any, N>[]> {
    const q = this.queue(queueName);
    return q.addBulk(jobs);
  }

  public worker(queueName: string, processor?: string | Processor<T, R, N>, opts?: WorkerOptions): Worker {
    if (!this.workers.has(queueName)) {
      const w = new Worker(queueName, processor, opts);
      this.workers.set(queueName, w);
    }
    return this.workers.get(queueName);
  }

  public addFlowJobs(flow: FlowJob, opts?: FlowOpts): Promise<JobNode> {
    if (!this.flow) {
      const baseOpts: QueueBaseOptions = {
        connection: this.opts.connection,
        prefix: this.opts.prefix
      };
      this.flow = new FlowProducer(baseOpts);
    }
    return this.flow.add(flow, opts);
  }
}

export * from './types';
