import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './create-event.dto';

@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Get('recent')
  findRecent(@Query('limit') limit?: string) {
    return this.eventsService.findRecent(limit ? parseInt(limit, 10) : 10);
  }
}
