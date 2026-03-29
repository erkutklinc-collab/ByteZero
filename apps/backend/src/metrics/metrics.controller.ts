import { Controller, Get, Param } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('api/metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('overview')
  getOverview() {
    return this.metricsService.getOverview();
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.metricsService.getLeaderboard();
  }

  @Get('report')
  getReport() {
    return this.metricsService.getReport();
  }

  @Get('departments')
  getDepartments() {
    return this.metricsService.getDepartments();
  }

  @Get('departments/:id')
  getDepartmentDetail(@Param('id') id: string) {
    return this.metricsService.getDepartmentDetail(parseInt(id, 10));
  }
}
