import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async dailyReport() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sales = await this.prisma.sale.findMany({
            where: {
                createdAt: {
                    gte: today,
                },
            },
        });

        const revenue = sales.reduce(
            (sum, sale) => sum + sale.total,
            0,
        );

        const discount = sales.reduce(
            (sum, sale) => sum + sale.discount,
            0,
        );

        return {
            date: today.toISOString().split('T')[0],
            totalInvoices: sales.length,
            revenue,
            discount,
            netRevenue: revenue,
        };
    }
    async weeklyReport() {
        const today = new Date();

        const lastWeek = new Date();
        lastWeek.setDate(today.getDate() - 6);
        lastWeek.setHours(0, 0, 0, 0);

        const sales = await this.prisma.sale.findMany({
            where: {
                createdAt: {
                    gte: lastWeek,
                },
            },
        });

        const revenue = sales.reduce(
            (sum, sale) => sum + sale.total,
            0,
        );

        const discount = sales.reduce(
            (sum, sale) => sum + sale.discount,
            0,
        );

        return {
            from: lastWeek.toISOString().split('T')[0],
            to: today.toISOString().split('T')[0],
            totalInvoices: sales.length,
            revenue,
            discount,
            netRevenue: revenue,
        };
    }
    async monthlyReport() {
        const now = new Date();

        const firstDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            1,
        );

        const sales = await this.prisma.sale.findMany({
            where: {
                createdAt: {
                    gte: firstDay,
                },
            },
        });

        const revenue = sales.reduce(
            (sum, sale) => sum + sale.total,
            0,
        );

        const discount = sales.reduce(
            (sum, sale) => sum + sale.discount,
            0,
        );

        return {
            month: now.toLocaleString('default', {
                month: 'long',
            }),
            year: now.getFullYear(),
            totalInvoices: sales.length,
            revenue,
            discount,
            netRevenue: revenue,
        };
    }
    async topProducts() {
        const products = await this.prisma.saleItem.groupBy({
            by: ['productId'],

            _sum: {
                quantity: true,
                total: true,
            },

            orderBy: {
                _sum: {
                    quantity: 'desc',
                },
            },

            take: 10,
        });

        return Promise.all(
            products.map(async (item) => {
                const product = await this.prisma.product.findUnique({
                    where: {
                        id: item.productId,
                    },
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        category: true,
                    },
                });

                return {
                    ...product,
                    soldQuantity: item._sum.quantity,
                    revenue: item._sum.total,
                };
            }),
        );
    }
    async lowStockProducts() {
        return this.prisma.product.findMany({
            where: {
                stock: {
                    lte: 10,
                },
            },
            orderBy: {
                stock: 'asc',
            },
            select: {
                id: true,
                name: true,
                code: true,
                category: true,
                stock: true,
                price: true,
            },
        });
    }
    async topCustomers() {
        const customers = await this.prisma.sale.groupBy({
            by: ['customerId'],

            where: {
                customerId: {
                    not: null,
                },
            },

            _count: {
                id: true,
            },

            _sum: {
                total: true,
            },

            orderBy: {
                _sum: {
                    total: 'desc',
                },
            },

            take: 10,
        });

        return Promise.all(
            customers.map(async (item) => {
                const customer = await this.prisma.customer.findUnique({
                    where: {
                        id: item.customerId!,
                    },
                    select: {
                        id: true,
                        name: true,
                        mobile: true,
                        balance: true,
                    },
                });

                return {
                    ...customer,
                    totalInvoices: item._count.id,
                    totalSpent: item._sum.total ?? 0,
                };
            }),
        );
    }
    async dateRangeReport(from: string, to: string) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);

        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);

        const sales = await this.prisma.sale.findMany({
            where: {
                createdAt: {
                    gte: fromDate,
                    lte: toDate,
                },
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        mobile: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const revenue = sales.reduce(
            (sum, sale) => sum + sale.total,
            0,
        );

        const discount = sales.reduce(
            (sum, sale) => sum + sale.discount,
            0,
        );

        return {
            from,
            to,
            totalInvoices: sales.length,
            revenue,
            discount,
            netRevenue: revenue,
            sales,
        };
    }

    async customerLedger(customerId: string) {
        // Check customer exists
        const customer = await this.prisma.customer.findUnique({
            where: {
                id: customerId,
            },
        });

        if (!customer) {
            throw new BadRequestException('Customer not found');
        }

        // Get all sales
        const sales = await this.prisma.sale.findMany({
            where: {
                customerId,
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        const totalPurchase = sales.reduce(
            (sum, sale) => sum + sale.total,
            0,
        );

        return {
            customer: {
                id: customer.id,
                name: customer.name,
                mobile: customer.mobile,
                openingBalance: customer.balance,
            },

            totalInvoices: sales.length,

            totalPurchase,

            currentBalance: customer.balance,

            transactions: sales,
        };
    }

    async productLedger(productId: string) {
        const product = await this.prisma.product.findUnique({
            where: {
                id: productId,
            },
        });

        if (!product) {
            throw new BadRequestException(
                'Product not found',
            );
        }

        const items = await this.prisma.saleItem.findMany({
            where: {
                productId,
            },
            include: {
                sale: {
                    include: {
                        customer: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                sale: {
                    createdAt: 'asc',
                },
            },
        });

        const totalSold = items.reduce(
            (sum, item) => sum + item.quantity,
            0,
        );

        const totalRevenue = items.reduce(
            (sum, item) => sum + item.total,
            0,
        );

        return {
            product: {
                id: product.id,
                name: product.name,
                code: product.code,
                category: product.category,
                price: product.price,
                currentStock: product.stock,
            },

            totalSold,
            totalRevenue,

            transactions: items.map(item => ({
                invoiceNo: item.sale.invoiceNo,
                date: item.sale.createdAt,
                customer: item.sale.customer?.name ?? 'Walk-in Customer',
                quantity: item.quantity,
                price: item.price,
                total: item.total,
            })),
        };
    }
}