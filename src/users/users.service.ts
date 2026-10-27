import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByMobile(mobile: string) {
    return this.prisma.user.findUnique({
      where: { mobile },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        mobile: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            sales: true,
            payments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async create(data: CreateUserDto) {
    const existing = await this.findByMobile(data.mobile);
    if (existing) {
      throw new BadRequestException('A user with this mobile number already exists');
    }

    const isHashed =
      data.password.startsWith('$2b$') || data.password.startsWith('$2a$');
    const hashedPassword = isHashed
      ? data.password
      : await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        name: data.name,
        mobile: data.mobile,
        password: hashedPassword,
        role: data.role || UserRole.CASHIER,
      },
      select: {
        id: true,
        name: true,
        mobile: true,
        role: true,
        createdAt: true,
        password: true,
      },
    });
  }

  async updateRole(id: string, role: UserRole) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        mobile: true,
        role: true,
      },
    });
  }

  async remove(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            sales: true,
            payments: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user._count.sales > 0 || user._count.payments > 0) {
      throw new BadRequestException(
        'Cannot delete staff user with existing recorded sales or payments. Change role instead.'
      );
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }
}