import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class CreateEventDto {
  @IsNumber()
  userId: number;

  @IsString()
  eventType: string;

  @IsNumber()
  co2Grams: number;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
