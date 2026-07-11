import {
 Controller,
 Get,
 Param,
 UseGuards
} from '@nestjs/common';

import { LedgerService } from './ledger.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';


@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('ledger')
export class LedgerController {


constructor(
 private ledgerService:LedgerService
){}



@Get('customer/:id')
customerLedger(
 @Param('id') id:string
){

 return this.ledgerService.customerLedger(id);

}


}