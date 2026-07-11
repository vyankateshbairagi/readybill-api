import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LedgerService {

  constructor(
    private prisma: PrismaService,
  ) {}


  async customerLedger(customerId: string) {


    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });


    if (!customer) {
      throw new BadRequestException(
        'Customer not found'
      );
    }



    // Fetch Sales
    const sales = await this.prisma.sale.findMany({
      where: {
        customerId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });



    // Fetch Payments
    const payments = await this.prisma.payment.findMany({
      where: {
        customerId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });



    const transactions:any[] = [];



    // SALE ENTRIES

    for(const sale of sales){

      transactions.push({

        id:sale.id,

        date:sale.createdAt,

        type:'SALE',

        reference:sale.invoiceNo,

        debit:sale.total,

        credit:0,

      });

    }




    // PAYMENT ENTRIES

    for(const payment of payments){

      transactions.push({

        id:payment.id,

        date:payment.createdAt,

        type:'PAYMENT',

        reference:payment.paymentMode,

        debit:0,

        credit:payment.amount,

      });

    }




    // SORT TRANSACTIONS

    transactions.sort(
      (a,b)=>
      new Date(a.date).getTime()
      -
      new Date(b.date).getTime()
    );





    // RUNNING BALANCE

   let runningBalance = customer.openingBalance;



    const ledger = transactions.map((item)=>{

      transactions.unshift({

 id:'opening',

 date:customer.createdAt,

 type:'OPENING_BALANCE',

 reference:'Opening Balance',

 debit:
   customer.openingBalance > 0
   ? customer.openingBalance
   : 0,

 credit:
   customer.openingBalance < 0
   ? Math.abs(customer.openingBalance)
   : 0,

});
     if(item.type === 'SALE'){

 runningBalance += item.debit;

}


if(item.type === 'PAYMENT'){

 runningBalance -= item.credit;

}


if(item.type === 'OPENING_BALANCE'){

 runningBalance = 
   item.debit - item.credit;

}


      return {

        ...item,

        balance: runningBalance,

      };


    });





    return {


      customer:{

        id:customer.id,

        name:customer.name,

        mobile:customer.mobile,

      },



      totalInvoices:sales.length,



      totalSales:
        sales.reduce(
          (sum,s)=>sum+s.total,
          0
        ),



      totalPayments:
        payments.reduce(
          (sum,p)=>sum+p.amount,
          0
        ),




      currentBalance:
        Math.abs(runningBalance),




      balanceType:
        runningBalance > 0
          ? 'CUSTOMER_DUE'
          : runningBalance < 0
          ? 'ADVANCE_PAYMENT'
          : 'SETTLED',




      transactions:ledger,

    };

  }

}