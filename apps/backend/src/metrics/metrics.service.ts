import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarbonEvent, User, Department } from '../entities';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(CarbonEvent)
    private readonly eventRepo: Repository<CarbonEvent>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
  ) {}

  async getOverview() {
    const totalCo2Result = await this.eventRepo
      .createQueryBuilder('e')
      .select('COALESCE(SUM(e.co2Grams), 0)', 'totalGrams')
      .getRawOne();

    const totalCo2Grams = parseFloat(totalCo2Result.totalGrams);
    const activeEmployees = await this.userRepo.count();

    return {
      totalCo2Kg: Math.round((totalCo2Grams / 1000) * 100) / 100,
      treesEquivalent: Math.round(totalCo2Grams / 21000 * 100) / 100, // ~21kg CO2 per tree/year
      activeEmployees,
    };
  }

  async getLeaderboard() {
    const rows = await this.eventRepo
      .createQueryBuilder('e')
      .innerJoin('e.user', 'u')
      .innerJoin('u.department', 'd')
      .select('d.id', 'departmentId')
      .addSelect('d.name', 'name')
      .addSelect('COUNT(DISTINCT u.id)', 'members')
      .addSelect('ROUND(SUM(e.co2Grams))', 'points')
      .groupBy('d.id')
      .orderBy('points', 'DESC')
      .getRawMany();

    return rows.map((r, i) => ({
      rank: i + 1,
      departmentId: r.departmentId,
      name: r.name,
      members: parseInt(r.members, 10),
      points: parseInt(r.points, 10),
    }));
  }
}
