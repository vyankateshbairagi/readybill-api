import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {

  constructor(
    private prisma: PrismaService,
  ) {}



  async create(dto: CreateCustomerDto) {

    const openingBalance = dto.openingBalance ?? 0;


    return this.prisma.customer.create({

      data: {

        name: dto.name,

        mobile: dto.mobile,

        openingBalance,

        balance: openingBalance,

      },

    });

  }




  findAll() {

    return this.prisma.customer.findMany({

      orderBy: {

        createdAt: 'desc',

      },

    });

  }




  async findOne(id: string) {

    const customer =
      await this.prisma.customer.findUnique({

        where: { id },

      });



    if (!customer) {

      throw new NotFoundException(
        'Customer not found'
      );

    }


    return customer;

  }




  async update(
    id: string,
    data: Partial<CreateCustomerDto>
  ) {


    await this.findOne(id);



    return this.prisma.customer.update({

      where: { id },


      data,

    });

  }





  async remove(id: string) {


    await this.findOne(id);



    return this.prisma.customer.delete({

      where: { id },

    });

  }

}