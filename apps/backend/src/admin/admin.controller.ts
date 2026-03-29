import { Controller, Post } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedDatabase } from '../seed';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly dataSource: DataSource) {}

  @Post('reset')
  async reset() {
    const result = await seedDatabase(this.dataSource);
    return { message: 'Database reset with seed data', ...result };
  }
}
