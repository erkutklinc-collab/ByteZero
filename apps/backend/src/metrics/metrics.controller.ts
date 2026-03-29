import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
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

  @Get('report/csv')
  async getReportCsv(@Res() res: Response) {
    const report = await this.metricsService.getReport();
    const lines: string[] = [];

    lines.push('ByteFootprint ESG Report');
    lines.push(`Generated,${new Date().toISOString().split('T')[0]}`);
    lines.push('');
    lines.push('Overview');
    lines.push(`Total CO2 Saved (kg),${report.overview.totalCo2Kg}`);
    lines.push(`Trees Equivalent,${report.overview.treesEquivalent}`);
    lines.push(`Active Employees,${report.overview.activeEmployees}`);
    lines.push('');
    lines.push('Department Breakdown');
    lines.push('Department,Members,CO2 Saved (g),Actions');
    for (const d of report.departments) {
      lines.push(`${d.name},${d.members},${d.totalCo2Grams},${d.totalEvents}`);
    }
    lines.push('');
    lines.push('Weekly Trends');
    lines.push('Week Starting,Email Deleted,Attachment Removed,Cache Cleared,Unsubscribes,Mailbox Scanned,Total (g)');
    for (const w of report.trends) {
      lines.push(`${w.weekStart},${w.breakdown.email_deleted ?? 0},${w.breakdown.attachment_removed ?? 0},${w.breakdown.cache_cleared ?? 0},${w.breakdown.unsubscribe_action ?? 0},${w.breakdown.mailbox_scanned ?? 0},${w.total}`);
    }

    const filename = `bytefootprint-report-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(lines.join('\n'));
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
