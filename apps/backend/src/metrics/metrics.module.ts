import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarbonEvent, User, Department } from '../entities';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

@Module({
  imports: [TypeOrmModule.forFeature([CarbonEvent, User, Department])],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
