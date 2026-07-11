import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Query } from '@nestjs/common';
import { Param } from '@nestjs/common';

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
    constructor(
        private readonly reportsService: ReportsService,
    ) { }

    @Get('daily')
    daily() {
        return this.reportsService.dailyReport();
    }
    @Get('weekly')
    weekly() {
        return this.reportsService.weeklyReport();
    }
    @Get('monthly')
    monthly() {
        return this.reportsService.monthlyReport();
    }
    @Get('top-products')
    topProducts() {
        return this.reportsService.topProducts();
    }
    @Get('low-stock')
    lowStockProducts() {
        return this.reportsService.lowStockProducts();
    }
    @Get('top-customers')
    topCustomers() {
        return this.reportsService.topCustomers();
    }

    @Get('date-range')
    dateRange(
        @Query('from') from: string,
        @Query('to') to: string,
    ) {
        return this.reportsService.dateRangeReport(from, to);
    }

    @Get('customer-ledger/:customerId')
    customerLedger(
        @Param('customerId') customerId: string,
    ) {
        return this.reportsService.customerLedger(customerId);
    }
    @Get('product-ledger/:productId')
    productLedger(
        @Param('productId') productId: string,
    ) {
        return this.reportsService.productLedger(productId);
    }
}