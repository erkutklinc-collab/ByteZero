import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarbonEvent } from '../entities';
import { CreateEventDto } from './create-event.dto';

// Simple CO2 estimates in grams per action
const CO2_FACTORS: Record<string, (meta?: Record<string, any>) => number> = {
  email_deleted: (meta) => {
    const sizeBytes = meta?.sizeBytes ?? 50_000; // default ~50KB
    return (sizeBytes / 1_000_000) * 0.2; // ~0.2g per MB of storage freed
  },
  attachment_removed: (meta) => {
    const sizeBytes = meta?.sizeBytes ?? 500_000;
    return (sizeBytes / 1_000_000) * 0.5; // attachments cost more to store
  },
  cache_cleared: (meta) => {
    const sizeBytes = meta?.sizeBytes ?? 10_000_000;
    return (sizeBytes / 1_000_000) * 0.1;
  },
  mailbox_scanned: () => 0, // awareness action, no direct savings
};

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(CarbonEvent)
    private readonly eventRepo: Repository<CarbonEvent>,
  ) {}

  async create(dto: CreateEventDto): Promise<CarbonEvent> {
    const factor = CO2_FACTORS[dto.eventType] ?? (() => 0);
    const co2Grams = factor(dto.metadata);

    const event = this.eventRepo.create({
      userId: dto.userId,
      eventType: dto.eventType,
      metadata: dto.metadata ?? {},
      co2Grams,
    });

    return this.eventRepo.save(event);
  }

  async findRecent(limit = 10): Promise<CarbonEvent[]> {
    return this.eventRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }
}
