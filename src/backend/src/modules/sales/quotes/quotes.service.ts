import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Quote, QuoteStatus } from '../entities/quote.entity';
import { Contact } from '../entities/contact.entity';
import { EmailService } from '@shared/email/email.service';
import {
  CreateQuoteDto,
  UpdateQuoteDto,
  SendQuoteDto,
  AcceptQuoteDto,
  RejectQuoteDto,
  QuoteQueryDto,
} from '../dto/create-quote.dto';

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Generate a unique quote number
   */
  private generateQuoteNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `${year}-Q${random}`;
  }

  /**
   * Create a new quote
   */
  async create(companyId: string, createDto: CreateQuoteDto, userId?: string): Promise<Quote> {
    // Verify contact exists
    const contact = await this.contactRepository.findOne({
      where: { id: createDto.contactId, companyId },
    });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    const quote = this.quoteRepository.create({
      ...createDto,
      companyId,
      quoteNumber: createDto.quoteNumber || this.generateQuoteNumber(),
      version: 1,
      status: createDto.status || QuoteStatus.DRAFT,
      statusChangedAt: new Date(),
      createdBy: userId,
      updatedBy: userId,
    });

    return this.quoteRepository.save(quote);
  }

  /**
   * Get all quotes with pagination and filtering
   */
  async findAll(companyId: string, query: QuoteQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      contactId,
      dealId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const where: FindOptionsWhere<Quote> = { companyId };

    if (status) {
      where.status = status;
    }
    if (contactId) {
      where.contactId = contactId;
    }
    if (dealId) {
      where.dealId = dealId;
    }

    const queryBuilder = this.quoteRepository.createQueryBuilder('quote')
      .leftJoinAndSelect('quote.contact', 'contact')
      .where('quote.companyId = :companyId', { companyId })
      .andWhere('quote.deletedAt IS NULL');

    if (status) {
      queryBuilder.andWhere('quote.status = :status', { status });
    }
    if (contactId) {
      queryBuilder.andWhere('quote.contactId = :contactId', { contactId });
    }
    if (dealId) {
      queryBuilder.andWhere('quote.dealId = :dealId', { dealId });
    }
    if (search) {
      queryBuilder.andWhere(
        '(quote.quoteNumber ILIKE :search OR quote.name ILIKE :search OR contact.firstName ILIKE :search OR contact.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sorting
    const validSortFields = ['createdAt', 'updatedAt', 'quoteNumber', 'totalAmount', 'status', 'validUntil'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`quote.${orderField}`, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single quote by ID
   */
  async findOne(companyId: string, id: string): Promise<Quote> {
    const quote = await this.quoteRepository.findOne({
      where: { id, companyId },
      relations: ['contact'],
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    return quote;
  }

  /**
   * Update a quote (creates new version if quote was already sent)
   */
  async update(
    companyId: string,
    id: string,
    updateDto: UpdateQuoteDto,
    userId?: string,
    createVersion: boolean = false,
  ): Promise<Quote> {
    const quote = await this.findOne(companyId, id);

    // If quote was sent and we need to track versions, create a new version
    if (createVersion && quote.status !== QuoteStatus.DRAFT) {
      return this.createVersion(companyId, id, updateDto, userId);
    }

    // Update existing quote
    Object.assign(quote, {
      ...updateDto,
      updatedBy: userId,
      statusChangedAt: updateDto.status && updateDto.status !== quote.status 
        ? new Date() 
        : quote.statusChangedAt,
    });

    return this.quoteRepository.save(quote);
  }

  /**
   * Create a new version of a quote
   */
  async createVersion(
    companyId: string,
    originalId: string,
    updateDto: UpdateQuoteDto,
    userId?: string,
  ): Promise<Quote> {
    const original = await this.findOne(companyId, originalId);

    // Mark original as revised
    original.status = QuoteStatus.REVISED;
    await this.quoteRepository.save(original);

    // Create new version
    const newQuote = this.quoteRepository.create({
      ...original,
      id: undefined, // Let TypeORM generate new ID
      ...updateDto,
      version: original.version + 1,
      previousVersionId: original.id,
      status: QuoteStatus.DRAFT,
      statusChangedAt: new Date(),
      sentAt: null,
      viewedAt: null,
      viewedCount: 0,
      signedAt: null,
      signedByName: null,
      signedByEmail: null,
      signatureData: null,
      createdAt: undefined,
      updatedAt: undefined,
      createdBy: userId,
      updatedBy: userId,
      revisionNotes: updateDto.revisionNotes,
    });

    return this.quoteRepository.save(newQuote);
  }

  /**
   * Delete a quote (soft delete)
   */
  async remove(companyId: string, id: string): Promise<void> {
    const quote = await this.findOne(companyId, id);
    await this.quoteRepository.softDelete(id);
  }

  /**
   * Clone an existing quote
   */
  async clone(companyId: string, id: string, userId?: string): Promise<Quote> {
    const original = await this.findOne(companyId, id);

    const cloned = this.quoteRepository.create({
      ...original,
      id: undefined,
      quoteNumber: this.generateQuoteNumber(),
      version: 1,
      previousVersionId: null,
      status: QuoteStatus.DRAFT,
      statusChangedAt: new Date(),
      sentAt: null,
      viewedAt: null,
      viewedCount: 0,
      signedAt: null,
      signedByName: null,
      signedByEmail: null,
      signatureData: null,
      createdAt: undefined,
      updatedAt: undefined,
      createdBy: userId,
      updatedBy: userId,
      name: original.name ? `${original.name} (Copy)` : 'Copy',
    });

    return this.quoteRepository.save(cloned);
  }

  /**
   * Send quote via email
   */
  async sendQuote(
    companyId: string,
    id: string,
    sendDto: SendQuoteDto,
    userId?: string,
    pdfBuffer?: Buffer,
  ): Promise<Quote> {
    const quote = await this.findOne(companyId, id);

    // Format currency helper
    const formatCurrency = (cents: number): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(cents / 100);
    };

    // Format date helper
    const formatDate = (date: Date | string): string => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    // Prepare line items summary
    const lineItemsSummary = quote.lineItems?.map(item => ({
      name: item.name,
      amount: formatCurrency(item.totalAmount),
    })) || [];

    // Send email
    try {
      await this.emailService.sendQuoteEmail({
        to: sendDto.recipientEmail,
        cc: sendDto.ccEmails,
        customSubject: sendDto.subject,
        customMessage: sendDto.message,
        pdfAttachment: sendDto.includePdf !== false ? pdfBuffer : undefined,
        quoteData: {
          quoteNumber: quote.quoteNumber,
          customerName: quote.contact 
            ? `${quote.contact.firstName} ${quote.contact.lastName}` 
            : 'Valued Customer',
          customerEmail: quote.contact?.email,
          totalAmount: formatCurrency(quote.totalAmount),
          validUntil: quote.validUntil 
            ? formatDate(quote.validUntil) 
            : formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
          lineItemsSummary,
          // quoteViewUrl could be added when customer portal is implemented
        },
      });

      this.logger.log(`Quote ${quote.quoteNumber} sent to ${sendDto.recipientEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send quote ${quote.quoteNumber}: ${error.message}`);
      throw new BadRequestException('Failed to send email. Please try again.');
    }

    // Update quote status to sent
    quote.status = QuoteStatus.SENT;
    quote.statusChangedAt = new Date();
    quote.sentAt = new Date();
    quote.sentToEmail = sendDto.recipientEmail;
    quote.updatedBy = userId;

    await this.quoteRepository.save(quote);

    return quote;
  }

  /**
   * Record that a quote was viewed
   */
  async recordView(companyId: string, id: string, ip?: string): Promise<Quote> {
    const quote = await this.findOne(companyId, id);

    // Only update status if not already accepted/rejected
    if (quote.status === QuoteStatus.SENT) {
      quote.status = QuoteStatus.VIEWED;
      quote.statusChangedAt = new Date();
    }

    if (!quote.viewedAt) {
      quote.viewedAt = new Date();
    }
    quote.viewedCount = (quote.viewedCount || 0) + 1;

    return this.quoteRepository.save(quote);
  }

  /**
   * Accept a quote (customer acceptance)
   */
  async accept(
    companyId: string,
    id: string,
    acceptDto: AcceptQuoteDto,
    ip?: string,
  ): Promise<Quote> {
    const quote = await this.findOne(companyId, id);

    // Validate quote can be accepted
    if (quote.status === QuoteStatus.ACCEPTED) {
      throw new BadRequestException('Quote has already been accepted');
    }
    if (quote.status === QuoteStatus.REJECTED) {
      throw new BadRequestException('Quote has been rejected');
    }
    if (quote.status === QuoteStatus.EXPIRED) {
      throw new BadRequestException('Quote has expired');
    }
    if (quote.status === QuoteStatus.REVISED) {
      throw new BadRequestException('This quote version has been revised. Please use the latest version.');
    }

    // Check expiration
    if (quote.validUntil && new Date(quote.validUntil) < new Date()) {
      quote.status = QuoteStatus.EXPIRED;
      await this.quoteRepository.save(quote);
      throw new BadRequestException('Quote has expired');
    }

    // Update quote
    quote.status = QuoteStatus.ACCEPTED;
    quote.statusChangedAt = new Date();
    quote.signedAt = new Date();
    quote.signedByName = acceptDto.signedByName;
    quote.signedByEmail = acceptDto.signedByEmail;
    quote.signatureData = acceptDto.signatureData;
    quote.signatureIp = ip;

    return this.quoteRepository.save(quote);
  }

  /**
   * Reject a quote
   */
  async reject(
    companyId: string,
    id: string,
    rejectDto: RejectQuoteDto,
  ): Promise<Quote> {
    const quote = await this.findOne(companyId, id);

    if (quote.status === QuoteStatus.ACCEPTED) {
      throw new BadRequestException('Quote has already been accepted');
    }

    quote.status = QuoteStatus.REJECTED;
    quote.statusChangedAt = new Date();
    quote.rejectionReason = rejectDto.rejectionReason;

    return this.quoteRepository.save(quote);
  }

  /**
   * Get version history for a quote
   */
  async getVersionHistory(companyId: string, id: string): Promise<Quote[]> {
    const quote = await this.findOne(companyId, id);

    // Find the root quote (original version)
    let rootQuoteNumber = quote.quoteNumber;

    // Get all versions with the same quote number
    const versions = await this.quoteRepository.find({
      where: { companyId, quoteNumber: rootQuoteNumber },
      order: { version: 'DESC' },
      relations: ['contact'],
    });

    return versions;
  }

  /**
   * Check and update expired quotes
   */
  async checkExpiredQuotes(companyId: string): Promise<number> {
    const result = await this.quoteRepository
      .createQueryBuilder()
      .update(Quote)
      .set({ status: QuoteStatus.EXPIRED, statusChangedAt: new Date() })
      .where('companyId = :companyId', { companyId })
      .andWhere('status IN (:...statuses)', { 
        statuses: [QuoteStatus.DRAFT, QuoteStatus.SENT, QuoteStatus.VIEWED] 
      })
      .andWhere('validUntil < :now', { now: new Date() })
      .execute();

    return result.affected || 0;
  }

  /**
   * Get quote statistics
   */
  async getStatistics(companyId: string) {
    const stats = await this.quoteRepository
      .createQueryBuilder('quote')
      .select('quote.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(quote.totalAmount)', 'totalValue')
      .where('quote.companyId = :companyId', { companyId })
      .andWhere('quote.deletedAt IS NULL')
      .groupBy('quote.status')
      .getRawMany();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentStats = await this.quoteRepository
      .createQueryBuilder('quote')
      .select('COUNT(*)', 'totalQuotes')
      .addSelect('SUM(CASE WHEN quote.status = :accepted THEN 1 ELSE 0 END)', 'acceptedCount')
      .addSelect('SUM(CASE WHEN quote.status = :rejected THEN 1 ELSE 0 END)', 'rejectedCount')
      .addSelect('SUM(CASE WHEN quote.status = :accepted THEN quote.totalAmount ELSE 0 END)', 'acceptedValue')
      .where('quote.companyId = :companyId', { companyId })
      .andWhere('quote.createdAt >= :thirtyDaysAgo', { thirtyDaysAgo })
      .andWhere('quote.deletedAt IS NULL')
      .setParameters({ accepted: QuoteStatus.ACCEPTED, rejected: QuoteStatus.REJECTED })
      .getRawOne();

    return {
      byStatus: stats,
      last30Days: recentStats,
    };
  }
}

