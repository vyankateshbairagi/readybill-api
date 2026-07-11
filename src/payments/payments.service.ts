import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
  ) { }

  async create(
    dto: CreatePaymentDto,
    userId: string,
  ) {

    const customer =
      await this.prisma.customer.findUnique({

        where: {
          id: dto.customerId,
        },

      });



    if (!customer) {

      throw new BadRequestException(
        'Customer not found'
      );

    }



    const payment =
      await this.prisma.$transaction(async (tx) => {


        // Create Payment

        const payment =
          await tx.payment.create({

            data: {

              customerId: dto.customerId,

              userId,

              amount: dto.amount,

              paymentMode: dto.paymentMode,

              note: dto.note,

            },

          });



        // Update Customer Balance

        const updatedCustomer =
          await tx.customer.update({

            where: {
              id: dto.customerId,
            },


            data: {

              balance: {
                decrement: dto.amount,
              },

            },


          });



        return {

          payment,

          balance:
            updatedCustomer.balance,

        };


      });



    return {

      message:
        'Payment received successfully',

      payment:
        payment.payment,


      remainingBalance:
        payment.balance,

    };

  }
  async findAll() {
    return this.prisma.payment.findMany({
      orderBy: {
        createdAt: 'desc',
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
    });
  }
  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: {
        id,
      },
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            name: true,
            mobile: true,
          },
        },
      },
    });

    if (!payment) {
      throw new BadRequestException(
        'Payment not found',
      );
    }

    return payment;
  }
  async findByCustomer(customerId: string) {
    return this.prisma.payment.findMany({
      where: {
        customerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}