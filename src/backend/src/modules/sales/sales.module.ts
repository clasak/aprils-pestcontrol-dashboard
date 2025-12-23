import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { ContactsController } from './contacts/contacts.controller';
import { ContactsService } from './contacts/contacts.service';
import { LeadsController } from './leads/leads.controller';
import { LeadsService } from './leads/leads.service';
import { DealsController } from './deals/deals.controller';
import { DealsService } from './deals/deals.service';
import { QuotesController } from './quotes/quotes.controller';
import { QuotesService } from './quotes/quotes.service';
import { Contact } from './entities/contact.entity';
import { Lead } from './entities/lead.entity';
import { Deal } from './entities/deal.entity';
import { Quote } from './entities/quote.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contact,
      Lead,
      Deal,
      Quote,
    ]),
  ],
  controllers: [
    SalesController,
    ContactsController,
    LeadsController,
    DealsController,
    QuotesController,
  ],
  providers: [
    SalesService,
    ContactsService,
    LeadsService,
    DealsService,
    QuotesService,
  ],
  exports: [
    SalesService,
    ContactsService,
    LeadsService,
    DealsService,
    QuotesService,
  ],
})
export class SalesModule {}
