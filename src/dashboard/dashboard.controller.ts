import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
    ) { }

    @Get()
    getDashboard() {
        return this.dashboardService.getDashboard();
    }

    @Get('recent-sales')
    getRecentSales() {
        return (this.dashboardService as any).getRecentSales();
    }

    @Get('low-stock')
    getLowStockProducts() {
        return this.dashboardService.getLowStockProducts();
    }
    @Get('monthly-summary')
    getMonthlySummary() {
        return this.dashboardService.getMonthlySummary();
    }
    @Get('top-products')
    getTopProducts() {
        return this.dashboardService.getTopProducts();
    }
}