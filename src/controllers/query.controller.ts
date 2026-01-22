import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { TelemetryEvent } from "../entities/TelemetryEvent";
import { logger } from "../utils/logger";
import { Between, FindOptionsWhere } from "typeorm";

export const queryEvents = async (req: Request, res: Response) => {
  try {
    const { start, end, source, page = 1, limit = 10 } = req.query;

    const where: FindOptionsWhere<TelemetryEvent> = {};

    if (source) {
      where.source = source as string;
    }

    if (start && end) {
      where.timestamp = Between(new Date(start as string), new Date(end as string));
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

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
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    logger.error("Error querying events", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
