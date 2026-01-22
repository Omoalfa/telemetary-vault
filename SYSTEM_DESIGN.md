# System Design - Telemetry Vault

## Overview
Telemetry Vault is a high-throughput ingestion service designed to handle telemetry events (logs, metrics, traces). It uses an asynchronous queue-based architecture to decouple ingestion from storage, ensuring high availability and low latency for producers.

## Architecture
- **API Layer**: Express.js server handling HTTP requests.
- **Queue Layer**: BullMQ (Redis) for buffering and asynchronous processing. Provides backpressure handling and retries.
- **Worker Layer**: Consumes events from the queue and writes to the database.
- **Storage Layer**: PostgreSQL for persistent storage of telemetry events.

## Burst Handling
- **Queue Buffering**: High traffic bursts are absorbed by Redis. The API simply pushes to the queue (very fast) and returns 202 Accepted.
- **Worker Scalability**: Workers process the queue at a sustainable rate. We can scale the number of consumer workers horizontally to increase throughput.
- **Rate Limiting**: An API-level rate limiter protects the system from abusive clients or potential DDoS, preserving resources for legitimate traffic.

## DB Hotspot Prevention
- **Sequential Writes**: Using `UUID` v4 might cause random insertion points which is not ideal for B-Tree fragmentation, but acceptable for this scale. For higher scale, we would use Time-Sortable UUIDs (UUID v7) or BigInt auto-increment.
- **Indexing**: Indices on `timestamp` and `source` optimize common queries.
- **Future Improvements**:
    - **Partitioning**: Partitioning the `telemetry_event` table by `timestamp` (e.g., daily partitions) is the standard way to avoid index bloat and hotspots.
    - **Batch Inserts**: Workers can buffer locally and insert rows in batches (e.g., `INSERT ... VALUES (...), (...)`) to reduce DB roundtrips.

## Pagination Strategy
- We use **Offset-based pagination** (`skip`/`take`) for the Query API for simplicity (`/query?page=1&limit=10`).
- **Trade-off**: Offset pagination gets slower deeper into the result set (`OFFSET N` has to scan N rows).
- **Better Approach**: For high scale, **Cursor-based pagination** using `timestamp` or `id` (e.g., `WHERE timestamp < last_timestamp LIMIT 10`) is preferred as it is O(1) mostly.

## Failure Modes
- **Redis Down**: API will fail to queue jobs. We can implement a fallback to a local file or memory buffer, but generally, Redis is treated as critical infrastructure.
- **DB Down**: Workers will fail to process jobs. BullMQ will automatically retry the job with exponential backoff. If it fails ultimately, it moves to Dead Letter Queue (DLQ) for manual inspection.
- **Worker Crash**: BullMQ ensures atomic processing; if a worker crashes, the job remains in the queue (or moves back to wait) to be picked up by another worker.

## Metrics and Alerts
- **Key Metrics**:
    - `ingest_rate`: Requests per second.
    - `queue_depth`: Number of waiting jobs in Redis. High depth indicates consumer lag.
    - `processing_time`: Time taken by worker to process a job.
    - `error_rate`: 5xx responses or failed jobs.
- **Alerts**:
    - High Queue Depth (> 1000 items).
    - High Error Rate (> 1%).
    - DB CPU/Memory usage.
