import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }
    async getDashboard() {
        // Today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Today's Sales
        const todaySales = await this.prisma.sale.findMany({
            where: {
                createdAt: {
                    gte: today,
                },
            },
        });

        // Today's Revenue
        const todayRevenue = todaySales.reduce(
            (sum, sale) => sum + sale.total,
            0,
        );

        // Total Products
        const totalProducts = await this.prisma.product.count();

        // Total Customers
        const totalCustomers = await this.prisma.customer.count();

        // Low Stock Products (stock <= 10)
        const lowStockProducts = await this.prisma.product.count({
            where: {
                stock: {
                    lte: 10,
                },
            },
        });

        return {
            todayRevenue,
            todaySales: todaySales.length,
            totalProducts,
            totalCustomers,
            lowStockProducts,
        };
    }
    async getRecentSales() {
        return this.prisma.sale.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    async getLowStockProducts() {
        return this.prisma.product.findMany({
            where: {
                stock: {
                    lte: 10,
                },
            },
            orderBy: {
                stock: 'asc',
            },
        });
    }
    async getMonthlySummary() {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const sales = await this.prisma.sale.findMany({
            where: {
                createdAt: {
                    gte: startOfMonth,
                },
            },
        });

        const revenue = sales.reduce(
            (sum, sale) => sum + sale.total,
            0,
        );

        return {
            month: startOfMonth.toLocaleString('default', {
                month: 'long',
                year: 'numeric',
            }),
            totalSales: sales.length,
            totalRevenue: revenue,
        };
    }
    async getTopProducts() {
        return this.prisma.saleItem.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
            },
            orderBy: {
                _sum: {
                    quantity: 'desc',
                },
            },
            take: 5,
        });
    }

}