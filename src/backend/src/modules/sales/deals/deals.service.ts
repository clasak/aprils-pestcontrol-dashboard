import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Between } from 'typeorm';
import { Deal, DealStatus, DealStage } from '../entities/deal.entity';
import { CreateDealDto } from '../dto/create-deal.dto';
import { UpdateDealDto } from '../dto/update-deal.dto';

interface FindAllQuery {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  stage?: string;
  ownerId?: string;
  salesRepId?: string;
  orgId?: string;
  minValue?: number;
  maxValue?: number;
  fromDate?: string;
  toDate?: string;
}

@Injectable()
export class DealsService {
  private readonly logger = new Logger(DealsService.name);

  // Stage probability mapping for forecasting
  private readonly stageProbabilities = {
    [DealStage.LEAD]: 10,
    [DealStage.INSPECTION_SCHEDULED]: 20,
    [DealStage.INSPECTION_COMPLETED]: 40,
    [DealStage.QUOTE_SENT]: 50,
    [DealStage.NEGOTIATION]: 70,
    [DealStage.VERBAL_COMMITMENT]: 80,
    [DealStage.CONTRACT_SENT]: 90,
    [DealStage.CLOSED_WON]: 100,
    [DealStage.CLOSED_LOST]: 0,
  };

  constructor(
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>,
  ) {}

  async findAll(query: FindAllQuery) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      stage,
      ownerId,
      salesRepId,
      orgId,
      minValue,
      maxValue,
      fromDate,
      toDate,
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.dealRepository
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.contact', 'contact')
      .where('deal.deleted_at IS NULL');

    if (orgId) {
      queryBuilder.andWhere('deal.org_id = :orgId', { orgId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(deal.title ILIKE :search OR deal.description ILIKE :search OR contact.first_name ILIKE :search OR contact.last_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('deal.status = :status', { status });
    }

    if (stage) {
      queryBuilder.andWhere('deal.stage = :stage', { stage });
    }

    if (ownerId) {
      queryBuilder.andWhere('deal.owner_id = :ownerId', { ownerId });
    }

    if (salesRepId) {
      queryBuilder.andWhere('deal.sales_rep_id = :salesRepId', { salesRepId });
    }

    if (minValue !== undefined) {
      queryBuilder.andWhere('deal.deal_value_cents >= :minValue', {
        minValue: minValue * 100,
      });
    }

    if (maxValue !== undefined) {
      queryBuilder.andWhere('deal.deal_value_cents <= :maxValue', {
        maxValue: maxValue * 100,
      });
    }

    if (fromDate) {
      queryBuilder.andWhere('deal.created_at >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('deal.created_at <= :toDate', { toDate });
    }

    const total = await queryBuilder.getCount();

    const deals = await queryBuilder
      .orderBy('deal.expected_close_date', 'ASC')
      .addOrderBy('deal.deal_value_cents', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      success: true,
      data: deals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, orgId?: string) {
    const queryBuilder = this.dealRepository
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.contact', 'contact')
      .where('deal.id = :id', { id })
      .andWhere('deal.deleted_at IS NULL');

    if (orgId) {
      queryBuilder.andWhere('deal.org_id = :orgId', { orgId });
    }

    const deal = await queryBuilder.getOne();

    if (!deal) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }

    return {
      success: true,
      data: deal,
    };
  }

  async create(createDealDto: CreateDealDto, userId?: string) {
    try {
      const deal = this.dealRepository.create({
        ...createDealDto,
        createdBy: userId,
        updatedBy: userId,
        lastActivityDate: new Date(),
      });

      // Set initial probability based on stage
      if (!deal.winProbability && deal.stage) {
        deal.winProbability = this.stageProbabilities[deal.stage];
      }

      // Calculate weighted value
      deal.weightedValueCents = Math.round(
        (deal.dealValueCents * deal.winProbability) / 100,
      );

      // Calculate lifetime value for recurring deals
      if (deal.recurringRevenueCents && deal.contractLengthMonths) {
        deal.lifetimeValueCents =
          deal.recurringRevenueCents * deal.contractLengthMonths +
          deal.dealValueCents;
      }

      // Initialize stage history
      deal.stageHistory = [
        {
          stage: deal.stage,
          enteredAt: new Date(),
        },
      ];

      const savedDeal = await this.dealRepository.save(deal);

      this.logger.log(`Deal created: ${savedDeal.id} by user ${userId}`);

      return {
        success: true,
        data: savedDeal,
        message: 'Deal created successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to create deal: ${error.message}`);
      throw error;
    }
  }

  async update(
    id: string,
    updateDealDto: UpdateDealDto,
    userId?: string,
    orgId?: string,
  ) {
    const deal = await this.dealRepository.findOne({
      where: {
        id,
        ...(orgId && { orgId }),
        deletedAt: IsNull(),
      },
    });

    if (!deal) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }

    const oldStage = deal.stage;

    Object.assign(deal, {
      ...updateDealDto,
      updatedBy: userId,
      lastActivityDate: new Date(),
    });

    // Update probability if stage changed
    if (updateDealDto.stage && updateDealDto.stage !== oldStage) {
      await this.trackStageChange(deal, oldStage, updateDealDto.stage);
      deal.winProbability = this.stageProbabilities[updateDealDto.stage];
      deal.stageDurationDays = 0;
    }

    // Recalculate weighted value
    deal.weightedValueCents = Math.round(
      (deal.dealValueCents * deal.winProbability) / 100,
    );

    // Recalculate lifetime value
    if (deal.recurringRevenueCents && deal.contractLengthMonths) {
      deal.lifetimeValueCents =
        deal.recurringRevenueCents * deal.contractLengthMonths +
        deal.dealValueCents;
    }

    const updatedDeal = await this.dealRepository.save(deal);

    this.logger.log(`Deal updated: ${id} by user ${userId}`);

    return {
      success: true,
      data: updatedDeal,
      message: 'Deal updated successfully',
    };
  }

  async remove(id: string, orgId?: string) {
    const deal = await this.dealRepository.findOne({
      where: {
        id,
        ...(orgId && { orgId }),
        deletedAt: IsNull(),
      },
    });

    if (!deal) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }

    await this.dealRepository.softDelete(id);

    this.logger.log(`Deal soft deleted: ${id}`);

    return {
      success: true,
      message: 'Deal deleted successfully',
    };
  }

  async moveToStage(
    id: string,
    newStage: DealStage,
    userId?: string,
    orgId?: string,
  ) {
    const deal = await this.dealRepository.findOne({
      where: {
        id,
        ...(orgId && { orgId }),
        deletedAt: IsNull(),
      },
    });

    if (!deal) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }

    const oldStage = deal.stage;

    if (oldStage === newStage) {
      throw new BadRequestException('Deal is already in this stage');
    }

    await this.trackStageChange(deal, oldStage, newStage);

    deal.stage = newStage;
    deal.winProbability = this.stageProbabilities[newStage];
    deal.weightedValueCents = Math.round(
      (deal.dealValueCents * deal.winProbability) / 100,
    );
    deal.stageDurationDays = 0;
    deal.lastActivityDate = new Date();
    deal.updatedBy = userId;

    await this.dealRepository.save(deal);

    this.logger.log(`Deal ${id} moved from ${oldStage} to ${newStage}`);

    return {
      success: true,
      message: `Deal moved to ${newStage} successfully`,
    };
  }

  async markAsWon(
    id: string,
    wonReason?: string,
    userId?: string,
    orgId?: string,
  ) {
    const deal = await this.dealRepository.findOne({
      where: {
        id,
        ...(orgId && { orgId }),
        deletedAt: IsNull(),
      },
    });

    if (!deal) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }

    deal.status = DealStatus.WON;
    deal.stage = DealStage.CLOSED_WON;
    deal.wonReason = wonReason;
    deal.actualCloseDate = new Date();
    deal.winProbability = 100;
    deal.weightedValueCents = deal.dealValueCents;
    deal.updatedBy = userId;

    await this.dealRepository.save(deal);

    this.logger.log(`Deal ${id} marked as won`);

    return {
      success: true,
      message: 'Deal marked as won successfully',
    };
  }

  async markAsLost(
    id: string,
    lostReason: string,
    lostToCompetitor?: string,
    userId?: string,
    orgId?: string,
  ) {
    const deal = await this.dealRepository.findOne({
      where: {
        id,
        ...(orgId && { orgId }),
        deletedAt: IsNull(),
      },
    });

    if (!deal) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }

    deal.status = DealStatus.LOST;
    deal.stage = DealStage.CLOSED_LOST;
    deal.lostReason = lostReason;
    deal.lostToCompetitor = lostToCompetitor;
    deal.actualCloseDate = new Date();
    deal.winProbability = 0;
    deal.weightedValueCents = 0;
    deal.updatedBy = userId;

    await this.dealRepository.save(deal);

    this.logger.log(`Deal ${id} marked as lost: ${lostReason}`);

    return {
      success: true,
      message: 'Deal marked as lost',
    };
  }

  async getPipelineView(orgId?: string) {
    const queryBuilder = this.dealRepository
      .createQueryBuilder('deal')
      .where('deal.deleted_at IS NULL')
      .andWhere('deal.status = :status', { status: DealStatus.OPEN });

    if (orgId) {
      queryBuilder.andWhere('deal.org_id = :orgId', { orgId });
    }

    const deals = await queryBuilder.getMany();

    // Group deals by stage
    const pipeline: Record<string, any[]> = {};
    const stageValues: Record<string, number> = {};
    const stageCounts: Record<string, number> = {};

    for (const stage of Object.values(DealStage)) {
      pipeline[stage] = [];
      stageValues[stage] = 0;
      stageCounts[stage] = 0;
    }

    for (const deal of deals) {
      pipeline[deal.stage].push(deal);
      stageValues[deal.stage] += deal.dealValueCents;
      stageCounts[deal.stage]++;
    }

    return {
      success: true,
      data: {
        pipeline,
        summary: {
          totalDeals: deals.length,
          totalValue: deals.reduce((sum, d) => sum + d.dealValueCents, 0),
          totalWeightedValue: deals.reduce((sum, d) => sum + d.weightedValueCents, 0),
          stageValues,
          stageCounts,
        },
      },
    };
  }

  async getForecast(orgId?: string) {
    const queryBuilder = this.dealRepository
      .createQueryBuilder('deal')
      .where('deal.deleted_at IS NULL')
      .andWhere('deal.status = :status', { status: DealStatus.OPEN });

    if (orgId) {
      queryBuilder.andWhere('deal.org_id = :orgId', { orgId });
    }

    const deals = await queryBuilder.getMany();

    const totalValue = deals.reduce((sum, d) => sum + d.dealValueCents, 0);
    const weightedValue = deals.reduce((sum, d) => sum + d.weightedValueCents, 0);

    // Group by expected close date
    const monthlyForecast: Record<string, any> = {};

    for (const deal of deals) {
      if (deal.expectedCloseDate) {
        const month = deal.expectedCloseDate.toISOString().substring(0, 7);
        if (!monthlyForecast[month]) {
          monthlyForecast[month] = {
            dealCount: 0,
            totalValue: 0,
            weightedValue: 0,
          };
        }
        monthlyForecast[month].dealCount++;
        monthlyForecast[month].totalValue += deal.dealValueCents;
        monthlyForecast[month].weightedValue += deal.weightedValueCents;
      }
    }

    return {
      success: true,
      data: {
        summary: {
          totalDeals: deals.length,
          totalValue: totalValue / 100,
          weightedValue: weightedValue / 100,
        },
        monthlyForecast,
      },
    };
  }

  async getStatistics(orgId?: string) {
    const queryBuilder = this.dealRepository
      .createQueryBuilder('deal')
      .where('deal.deleted_at IS NULL');

    if (orgId) {
      queryBuilder.andWhere('deal.org_id = :orgId', { orgId });
    }

    const total = await queryBuilder.getCount();
    const open = await queryBuilder
      .clone()
      .andWhere('deal.status = :status', { status: DealStatus.OPEN })
      .getCount();
    const won = await queryBuilder
      .clone()
      .andWhere('deal.status = :status', { status: DealStatus.WON })
      .getCount();
    const lost = await queryBuilder
      .clone()
      .andWhere('deal.status = :status', { status: DealStatus.LOST })
      .getCount();

    const winRate = total > 0 ? (won / (won + lost)) * 100 : 0;

    const totalValue = await queryBuilder
      .select('SUM(deal.deal_value_cents)', 'total')
      .getRawOne();

    const avgDealSize = await queryBuilder
      .select('AVG(deal.deal_value_cents)', 'avg')
      .getRawOne();

    return {
      success: true,
      data: {
        total,
        open,
        won,
        lost,
        winRate: Math.round(winRate * 100) / 100,
        totalValue: Math.round((parseFloat(totalValue?.total || '0') / 100) * 100) / 100,
        avgDealSize: Math.round((parseFloat(avgDealSize?.avg || '0') / 100) * 100) / 100,
      },
    };
  }

  // Private helper methods

  private async trackStageChange(deal: Deal, oldStage: DealStage, newStage: DealStage) {
    const now = new Date();

    // Update the last stage in history with exit time
    if (deal.stageHistory && deal.stageHistory.length > 0) {
      const lastStage = deal.stageHistory[deal.stageHistory.length - 1];
      if (lastStage && !lastStage.exitedAt) {
        lastStage.exitedAt = now;
        const durationMs = now.getTime() - new Date(lastStage.enteredAt).getTime();
        lastStage.durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
      }
    }

    // Add new stage to history
    deal.stageHistory = [
      ...deal.stageHistory,
      {
        stage: newStage,
        enteredAt: now,
      },
    ];

    // Update days in pipeline
    const pipelineDurationMs = now.getTime() - deal.createdAt.getTime();
    deal.daysInPipeline = Math.floor(pipelineDurationMs / (1000 * 60 * 60 * 24));
  }
}
