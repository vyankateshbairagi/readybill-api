import {
    Body,
    Controller,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Get, Param } from '@nestjs/common';

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
    ) { }

    @Post()
    create(
        @Body() dto: CreatePaymentDto,
        @Req() req,
    ) {
        return this.paymentsService.create(
            dto,
            req.user.userId,
        );
    }

    @Get()
findAll() {
  return this.paymentsService.findAll();
}



@Get('customer/:customerId')
findByCustomer(
  @Param('customerId') customerId: string,
) {
  return this.paymentsService.findByCustomer(customerId);
}
@Get(':id')
findOne(@Param('id') id: string) {
  return this.paymentsService.findOne(id);
}
}