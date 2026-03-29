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

  async getDepartments() {
    const rows = await this.eventRepo
      .createQueryBuilder('e')
      .innerJoin('e.user', 'u')
      .innerJoin('u.department', 'd')
      .select('d.id', 'id')
      .addSelect('d.name', 'name')
      .addSelect('COUNT(DISTINCT u.id)', 'members')
      .addSelect('ROUND(SUM(e.co2Grams))', 'totalCo2Grams')
      .addSelect('COUNT(e.id)', 'totalEvents')
      .groupBy('d.id')
      .orderBy('totalCo2Grams', 'DESC')
      .getRawMany();

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      members: parseInt(r.members, 10),
      totalCo2Grams: parseInt(r.totalCo2Grams, 10),
      totalEvents: parseInt(r.totalEvents, 10),
    }));
  }

  async getDepartmentDetail(id: number) {
    const dept = await this.deptRepo.findOne({ where: { id } });
    if (!dept) return null;

    // Department totals by event type
    const byType = await this.eventRepo
      .createQueryBuilder('e')
      .innerJoin('e.user', 'u')
      .where('u.departmentId = :id', { id })
      .select('e.eventType', 'eventType')
      .addSelect('ROUND(SUM(e.co2Grams))', 'co2Grams')
      .addSelect('COUNT(e.id)', 'count')
      .groupBy('e.eventType')
      .getRawMany();

    // Top contributors
    const contributors = await this.eventRepo
      .createQueryBuilder('e')
      .innerJoin('e.user', 'u')
      .where('u.departmentId = :id', { id })
      .select('u.id', 'userId')
      .addSelect('u.name', 'name')
      .addSelect('ROUND(SUM(e.co2Grams))', 'co2Grams')
      .addSelect('COUNT(e.id)', 'events')
      .groupBy('u.id')
      .orderBy('co2Grams', 'DESC')
      .getRawMany();

    // Recent events
    const recentEvents = await this.eventRepo
      .createQueryBuilder('e')
      .innerJoin('e.user', 'u')
      .where('u.departmentId = :id', { id })
      .select(['e.id', 'e.eventType', 'e.co2Grams', 'e.createdAt', 'u.name'])
      .orderBy('e.createdAt', 'DESC')
      .limit(50)
      .getMany();

    return {
      id: dept.id,
      name: dept.name,
      breakdown: byType.map((r) => ({
        eventType: r.eventType,
        co2Grams: parseInt(r.co2Grams, 10),
        count: parseInt(r.count, 10),
      })),
      contributors: contributors.map((r, i) => ({
        rank: i + 1,
        userId: r.userId,
        name: r.name,
        co2Grams: parseInt(r.co2Grams, 10),
        events: parseInt(r.events, 10),
      })),
      recentEvents: recentEvents.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        co2Grams: e.co2Grams,
        createdAt: e.createdAt,
        userName: e.user.name,
      })),
    };
  }

  async getWeeklyTrends() {
    // Get CO2 per week per event type for the last 4 weeks
    const rows = await this.eventRepo
      .createQueryBuilder('e')
      .select("strftime('%W', e.createdAt)", 'week')
      .addSelect("strftime('%Y-%m-%d', e.createdAt, 'weekday 0', '-6 days')", 'weekStart')
      .addSelect('e.eventType', 'eventType')
      .addSelect('ROUND(SUM(e.co2Grams))', 'co2Grams')
      .addSelect('COUNT(e.id)', 'count')
      .groupBy('week')
      .addGroupBy('e.eventType')
      .orderBy('week', 'ASC')
      .getRawMany();

    // Group by week
    const weekMap = new Map<string, { weekStart: string; breakdown: Record<string, number>; total: number }>();
    for (const r of rows) {
      if (!weekMap.has(r.week)) {
        weekMap.set(r.week, { weekStart: r.weekStart, breakdown: {}, total: 0 });
      }
      const w = weekMap.get(r.week)!;
      const grams = parseInt(r.co2Grams, 10);
      w.breakdown[r.eventType] = grams;
      w.total += grams;
    }

    return Array.from(weekMap.values());
  }

  async getReport() {
    const overview = await this.getOverview();
    const departments = await this.getDepartments();
    const trends = await this.getWeeklyTrends();

    const totalCo2Grams = overview.totalCo2Kg * 1000;

    // Environmental equivalencies
    const equivalencies = {
      treesPlanted: Math.round(totalCo2Grams / 21000 * 100) / 100,
      kmDrivingOffset: Math.round(totalCo2Grams / 120 * 100) / 100,       // ~120g CO2/km avg car
      smartphoneCharges: Math.round(totalCo2Grams / 8.22),                 // ~8.22g CO2 per charge
      hoursLedBulb: Math.round(totalCo2Grams / 6),                         // ~6g CO2 per hour
      litersWaterSaved: Math.round(totalCo2Grams / 0.3),                   // rough digital water-energy nexus
    };

    // Projection: annualize from data span
    const daysCovered = trends.length * 7 || 1;
    const dailyRate = totalCo2Grams / daysCovered;
    const projectedAnnualKg = Math.round(dailyRate * 365 / 1000 * 100) / 100;

    return {
      overview,
      equivalencies,
      projection: {
        dailyRateGrams: Math.round(dailyRate * 100) / 100,
        projectedAnnualKg,
        projectedAnnualTrees: Math.round(dailyRate * 365 / 21000 * 100) / 100,
      },
      departments,
      trends,
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
