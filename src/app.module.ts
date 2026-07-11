import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CustomersModule } from './customers/customers.module';
import { SalesModule } from './sales/sales.module';
import { PrismaModule } from './prisma/prisma.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { PaymentsModule } from './payments/payments.module';
import { LedgerModule } from './ledger/ledger.module';
@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProductsModule,
    CustomersModule,
    SalesModule,
    PrismaModule, DashboardModule, ReportsModule, PaymentsModule, LedgerModule,
  ],
})
export class AppModule { }
