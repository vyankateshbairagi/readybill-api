import {
    Body,
    Controller,
    Delete,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Get, Param } from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SalesService } from './sales.service';

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
    constructor(private readonly salesService: SalesService) { }
    @Get()
    findAll() {
        return this.salesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.salesService.findOne(id);
    }
    @Post()
    create(@Body() dto: CreateSaleDto, @Req() req) {
        return this.salesService.create(dto, req.user.userId);
    }
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.salesService.remove(id);
    }
}