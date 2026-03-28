import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department, User, CarbonEvent } from './entities';
import { EventsModule } from './events/events.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'db.sqlite',
      entities: [Department, User, CarbonEvent],
      synchronize: true, // auto-create tables in dev
    }),
    EventsModule,
    MetricsModule,
  ],
})
export class AppModule {}
