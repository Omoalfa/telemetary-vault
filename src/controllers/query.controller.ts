import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { TelemetryEvent } from "../entities/TelemetryEvent";
import { logger } from "../utils/logger";
import { Between, FindOptionsWhere } from "typeorm";

export const queryEvents = async (req: Request, res: Response) => {
  try {
    const { start, end, source } = req.query;
    // express-validator specific sanitation ensures these are numbers if present
    const page = req.query.page as unknown as number || 1;
    const limit = req.query.limit as unknown as number || 10;
    const userId = req.user?.id;

    const where: FindOptionsWhere<TelemetryEvent> = {
      user: { id: userId }
    };

    if (source) {
      where.source = source as string;
    }

    if (start && end) {
      where.timestamp = Between(new Date(start as string), new Date(end as string));
    }

    const skip = (page - 1) * limit;
    const take = limit;

    const eventRepository = AppDataSource.getRepository(TelemetryEvent);
    const [events, total] = await eventRepository.findAndCount({
      where,
      order: { timestamp: "DESC" },
      skip,
      take
    });

    res.json({
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    logger.error("Error querying events", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
