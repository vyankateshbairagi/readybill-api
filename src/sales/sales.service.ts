import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
    constructor(private prisma: PrismaService) { }

    private async generateInvoiceNo(): Promise<string> {
        const lastSale = await this.prisma.sale.findFirst({
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!lastSale) {
            return 'RB000001';
        }

        const lastNumber = parseInt(lastSale.invoiceNo.replace('RB', ''));
        const nextNumber = lastNumber + 1;

        return `RB${nextNumber.toString().padStart(6, '0')}`;
    }

    async create(dto: CreateSaleDto, userId: string) {
        const invoiceNo = await this.generateInvoiceNo();

        let customer: Awaited<ReturnType<typeof this.prisma.customer.findUnique>> | null = null;

        if (dto.customerId) {
            customer = await this.prisma.customer.findUnique({
                where: { id: dto.customerId },
            });

            if (!customer) {
                throw new BadRequestException('Customer not found');
            }
        }

        let subtotal = 0;

        const saleItems: { productId: string; quantity: number; price: number; total: number }[] = [];

        for (const item of dto.items) {
            console.log('Checking Product =>', item.productId);

            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
            });

            console.log('Product =>', product);

            if (!product) {
                throw new BadRequestException(
                    `Product not found: ${item.productId}`,
                );
            }

            if (product.stock < item.quantity) {
                throw new BadRequestException(
                    `${product.name} has only ${product.stock} stock available`,
                );
            }

            const total = product.price * item.quantity;

            subtotal += total;

            saleItems.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price,
                total,
            });
        }

        const discount = dto.discount ?? 0;
        const grandTotal = subtotal - discount;

        const result = await this.prisma.$transaction(async (tx) => {

            // 1. Create Sale
            const sale = await tx.sale.create({
                data: {
                    invoiceNo,
                    customerId: dto.customerId,
                    userId,
                    subtotal,
                    discount,
                    total: grandTotal,
                },
            });

            // 2. Create Sale Items
            for (const item of saleItems) {
                await tx.saleItem.create({
                    data: {
                        saleId: sale.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.total,
                    },
                });
            }

            // 3. Reduce Product Stock
            for (const item of saleItems) {
                await tx.product.update({
                    where: {
                        id: item.productId,
                    },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
            }
            return sale;

        });
        return {
            sale: result,
            customer,
            subtotal,
            discount,
            grandTotal,
            items: saleItems,
        };
    }
}