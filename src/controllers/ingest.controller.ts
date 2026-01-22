import { Request, Response } from "express";
import { ingestQueue } from "../queue/ingest.queue";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";

export const ingestEvent = async (req: Request, res: Response) => {
  try {
    const { source, payload, timestamp } = req.body;

    if (!source || !payload) {
      return res.status(400).json({ error: "Missing source or payload" });
    }

    // Generate ID if not present in payload, but usually it's passed or we generate a system ID.
    // Prompt says "Idempotent ingestion", implying duplicates might be sent. 
    // If client sends an ID, we use it. If not, we generate one, but then we can't dedup retries unless payload hash.
    // For simplicity, we'll assume client MIGHT send 'id' or we generate 'event_id'.
    // If the requirement implies "same request sent twice should not duplicate", checking body hash or if client sends a request-id is key.
    // I will use uuidv4() for now, but really deduplication relies on client-provided IDs.

    const event_id = req.body.event_id || uuidv4();
    const eventTimestamp = timestamp ? new Date(timestamp) : new Date();

    await ingestQueue.add("telemetry-event", {
      event_id,
      timestamp: eventTimestamp,
      source,
      payload
    }, {
      jobId: event_id, // Deduplication in queue
      removeOnComplete: true,
      removeOnFail: 1000
    });

    res.status(202).json({ message: "Event accepted", event_id });
  } catch (error) {
    logger.error("Error ingesting event", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
