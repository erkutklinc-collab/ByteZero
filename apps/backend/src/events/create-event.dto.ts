import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class CreateEventDto {
  @IsNumber()
  userId: number;

  @IsString()
  eventType: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
