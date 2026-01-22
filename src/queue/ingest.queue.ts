import { Queue, Worker } from "bullmq";
import { AppDataSource } from "../data-source";
import { TelemetryEvent } from "../entities/TelemetryEvent";
import { logger } from "../utils/logger";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

export const ingestQueue = new Queue("ingest-queue", { connection });

// Initialize Worker
const worker = new Worker("ingest-queue", async (job) => {
  try {
    const { event_id, timestamp, source, payload, userId } = job.data;

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const eventRepository = AppDataSource.getRepository(TelemetryEvent);

    // Idempotent Insert using ON CONFLICT DO NOTHING
    await eventRepository.createQueryBuilder()
      .insert()
      .into(TelemetryEvent)
      .values({
        event_id,
        timestamp,
        source,
        payload,
        user: { id: userId }
      })
      .orIgnore()
      .execute();

  } catch (error) {
    logger.error(`Error processing job ${job.id}`, error);
    throw error;
  }
}, {
  connection,
  concurrency: 10
});

worker.on('completed', job => {
  // logger.info(`Job ${job.id} completed`); // Verbose
});

worker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed: ${err.message}`);
});
