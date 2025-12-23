import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Between } from 'typeorm';
import { Lead, LeadStatus } from '../entities/lead.entity';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { UpdateLeadDto } from '../dto/update-lead.dto';

interface FindAllQuery {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  assignedTo?: string;
  priority?: string;
  companyId?: string;
  minScore?: number;
  maxScore?: number;
  fromDate?: string;
  toDate?: string;
}

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  async findAll(query: FindAllQuery) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      assignedTo,
      priority,
      companyId,
      minScore,
      maxScore,
      fromDate,
      toDate,
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.leadRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.contact', 'contact')
      .where('lead.deleted_at IS NULL');

    if (companyId) {
      queryBuilder.andWhere('lead.company_id = :companyId', { companyId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(lead.title ILIKE :search OR lead.description ILIKE :search OR contact.first_name ILIKE :search OR contact.last_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('lead.status = :status', { status });
    }

    if (assignedTo) {
      queryBuilder.andWhere('lead.assigned_to = :assignedTo', { assignedTo });
    }

    if (priority) {
      queryBuilder.andWhere('lead.priority = :priority', { priority });
    }

    if (minScore !== undefined) {
      queryBuilder.andWhere('lead.lead_score >= :minScore', { minScore });
    }

    if (maxScore !== undefined) {
      queryBuilder.andWhere('lead.lead_score <= :maxScore', { maxScore });
    }

    if (fromDate) {
      queryBuilder.andWhere('lead.created_at >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('lead.created_at <= :toDate', { toDate });
    }

    const total = await queryBuilder.getCount();

    const leads = await queryBuilder
      .orderBy('lead.lead_score', 'DESC')
      .addOrderBy('lead.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      success: true,
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId?: string) {
    const queryBuilder = this.leadRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.contact', 'contact')
      .where('lead.id = :id', { id })
      .andWhere('lead.deleted_at IS NULL');

    if (companyId) {
      queryBuilder.andWhere('lead.company_id = :companyId', { companyId });
    }

    const lead = await queryBuilder.getOne();

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return {
      success: true,
      data: lead,
    };
  }

  async create(createLeadDto: CreateLeadDto, userId?: string) {
    try {
      const lead = this.leadRepository.create({
        ...createLeadDto,
        createdBy: userId,
        updatedBy: userId,
        firstContactDate: new Date(),
      });

      // Calculate initial lead score
      lead.leadScore = this.calculateLeadScore(lead);

      const savedLead = await this.leadRepository.save(lead);

      this.logger.log(`Lead created: ${savedLead.id} by user ${userId}`);

      return {
        success: true,
        data: savedLead,
        message: 'Lead created successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to create lead: ${error.message}`);
      throw error;
    }
  }

  async update(
    id: string,
    updateLeadDto: UpdateLeadDto,
    userId?: string,
    companyId?: string,
  ) {
    const lead = await this.leadRepository.findOne({
      where: {
        id,
        ...(companyId && { companyId }),
        deletedAt: IsNull(),
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    Object.assign(lead, {
      ...updateLeadDto,
      updatedBy: userId,
    });

    // Recalculate lead score if relevant fields changed
    if (this.shouldRecalculateScore(updateLeadDto)) {
      lead.leadScore = this.calculateLeadScore(lead);
    }

    // Track status changes
    if (updateLeadDto.status && updateLeadDto.status !== lead.status) {
      await this.trackStatusChange(lead, updateLeadDto.status);
    }

    const updatedLead = await this.leadRepository.save(lead);

    this.logger.log(`Lead updated: ${id} by user ${userId}`);

    return {
      success: true,
      data: updatedLead,
      message: 'Lead updated successfully',
    };
  }

  async remove(id: string, companyId?: string) {
    const lead = await this.leadRepository.findOne({
      where: {
        id,
        ...(companyId && { companyId }),
        deletedAt: IsNull(),
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    await this.leadRepository.softDelete(id);

    this.logger.log(`Lead soft deleted: ${id}`);

    return {
      success: true,
      message: 'Lead deleted successfully',
    };
  }

  async assignLead(
    id: string,
    assignedTo: string,
    userId?: string,
    companyId?: string,
  ) {
    const lead = await this.leadRepository.findOne({
      where: {
        id,
        ...(companyId && { companyId }),
        deletedAt: IsNull(),
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    lead.assignedTo = assignedTo;
    lead.assignedAt = new Date();
    lead.updatedBy = userId;

    await this.leadRepository.save(lead);

    this.logger.log(`Lead ${id} assigned to user ${assignedTo}`);

    return {
      success: true,
      message: 'Lead assigned successfully',
    };
  }

  async qualifyLead(
    id: string,
    isQualified: boolean,
    notes?: string,
    userId?: string,
    companyId?: string,
  ) {
    const lead = await this.leadRepository.findOne({
      where: {
        id,
        ...(companyId && { companyId }),
        deletedAt: IsNull(),
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    lead.isQualified = isQualified;
    lead.qualificationNotes = notes;
    lead.status = isQualified ? LeadStatus.QUALIFIED : LeadStatus.UNQUALIFIED;
    lead.updatedBy = userId;

    await this.leadRepository.save(lead);

    this.logger.log(`Lead ${id} ${isQualified ? 'qualified' : 'disqualified'}`);

    return {
      success: true,
      message: `Lead ${isQualified ? 'qualified' : 'disqualified'} successfully`,
    };
  }

  async convertToDeal(id: string, dealId: string, userId?: string, companyId?: string) {
    const lead = await this.leadRepository.findOne({
      where: {
        id,
        ...(companyId && { companyId }),
        deletedAt: IsNull(),
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    lead.status = LeadStatus.CONVERTED;
    lead.convertedToDealId = dealId;
    lead.convertedAt = new Date();
    lead.updatedBy = userId;

    await this.leadRepository.save(lead);

    this.logger.log(`Lead ${id} converted to deal ${dealId}`);

    return {
      success: true,
      message: 'Lead converted to deal successfully',
    };
  }

  async markAsLost(
    id: string,
    reason: string,
    userId?: string,
    companyId?: string,
  ) {
    const lead = await this.leadRepository.findOne({
      where: {
        id,
        ...(companyId && { companyId }),
        deletedAt: IsNull(),
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    lead.status = LeadStatus.LOST;
    lead.lostReason = reason;
    lead.lostAt = new Date();
    lead.updatedBy = userId;

    await this.leadRepository.save(lead);

    this.logger.log(`Lead ${id} marked as lost: ${reason}`);

    return {
      success: true,
      message: 'Lead marked as lost',
    };
  }

  async getLeadStatistics(companyId?: string) {
    const queryBuilder = this.leadRepository
      .createQueryBuilder('lead')
      .where('lead.deleted_at IS NULL');

    if (companyId) {
      queryBuilder.andWhere('lead.company_id = :companyId', { companyId });
    }

    const total = await queryBuilder.getCount();
    const newLeads = await queryBuilder
      .clone()
      .andWhere('lead.status = :status', { status: LeadStatus.NEW })
      .getCount();
    const qualified = await queryBuilder
      .clone()
      .andWhere('lead.is_qualified = true')
      .getCount();
    const converted = await queryBuilder
      .clone()
      .andWhere('lead.status = :status', { status: LeadStatus.CONVERTED })
      .getCount();

    const conversionRate = total > 0 ? (converted / total) * 100 : 0;

    const avgScore = await queryBuilder
      .select('AVG(lead.lead_score)', 'avgScore')
      .getRawOne();

    return {
      success: true,
      data: {
        total,
        newLeads,
        qualified,
        converted,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageScore: Math.round(parseFloat(avgScore?.avgScore || '0') * 100) / 100,
        byStatus: {
          new: newLeads,
          contacted: await queryBuilder
            .clone()
            .andWhere('lead.status = :status', { status: LeadStatus.CONTACTED })
            .getCount(),
          qualified: await queryBuilder
            .clone()
            .andWhere('lead.status = :status', { status: LeadStatus.QUALIFIED })
            .getCount(),
          nurturing: await queryBuilder
            .clone()
            .andWhere('lead.status = :status', { status: LeadStatus.NURTURING })
            .getCount(),
          converted,
          lost: await queryBuilder
            .clone()
            .andWhere('lead.status = :status', { status: LeadStatus.LOST })
            .getCount(),
        },
      },
    };
  }

  // Private helper methods

  private calculateLeadScore(lead: Lead): number {
    let score = 50; // Base score

    // Score based on priority
    const priorityScores = { low: 0, medium: 10, high: 20, urgent: 30 };
    score += priorityScores[lead.priority] || 0;

    // Score based on estimated value
    if (lead.estimatedValueCents) {
      if (lead.estimatedValueCents > 100000) score += 20;
      else if (lead.estimatedValueCents > 50000) score += 15;
      else if (lead.estimatedValueCents > 25000) score += 10;
      else score += 5;
    }

    // Score based on property size
    if (lead.propertySizeSqft) {
      if (lead.propertySizeSqft > 5000) score += 10;
      else if (lead.propertySizeSqft > 2500) score += 5;
    }

    // Score based on lead source
    const sourceScores = { referral: 15, partner: 12, organic: 8, paid: 5 };
    score += sourceScores[lead.leadSourceCategory] || 3;

    // Score based on contact attempts (engagement)
    if (lead.contactAttempts > 0) {
      score += Math.min(lead.contactAttempts * 2, 10);
    }

    // Penalty for age (older leads score lower)
    const ageInDays = Math.floor(
      (Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (ageInDays > 30) score -= 20;
    else if (ageInDays > 14) score -= 10;
    else if (ageInDays > 7) score -= 5;

    // Ensure score is within 0-100 range
    return Math.max(0, Math.min(100, score));
  }

  private shouldRecalculateScore(updateDto: UpdateLeadDto): boolean {
    return !!(
      updateDto.priority ||
      updateDto.estimatedValueCents ||
      updateDto.propertySizeSqft ||
      updateDto.leadSourceCategory ||
      updateDto.contactAttempts
    );
  }

  private async trackStatusChange(lead: Lead, newStatus: LeadStatus) {
    // Update timestamp fields based on status
    if (newStatus === LeadStatus.CONTACTED && !lead.firstContactDate) {
      lead.firstContactDate = new Date();
    }

    if (newStatus === LeadStatus.CONTACTED) {
      lead.lastContactDate = new Date();
      lead.contactAttempts += 1;
    }

    if (newStatus === LeadStatus.QUALIFIED) {
      lead.isQualified = true;
    }

    if (newStatus === LeadStatus.UNQUALIFIED) {
      lead.isQualified = false;
    }
  }
}
