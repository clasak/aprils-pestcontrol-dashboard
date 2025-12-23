import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, IsNull } from 'typeorm';
import { Contact } from '../entities/contact.entity';
import { CreateContactDto } from '../dto/create-contact.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';

interface FindAllQuery {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  status?: string;
  tags?: string;
  orgId?: string;
}

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async findAll(query: FindAllQuery) {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      status,
      tags,
      orgId,
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.contactRepository
      .createQueryBuilder('contact')
      .where('contact.deleted_at IS NULL');

    // Filter by organization
    if (orgId) {
      queryBuilder.andWhere('contact.org_id = :orgId', { orgId });
    }

    // Search across multiple fields
    if (search) {
      queryBuilder.andWhere(
        '(contact.first_name ILIKE :search OR contact.last_name ILIKE :search OR contact.email ILIKE :search OR contact.phone ILIKE :search OR contact.company_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by type
    if (type) {
      queryBuilder.andWhere('contact.type = :type', { type });
    }

    // Filter by status
    if (status) {
      queryBuilder.andWhere('contact.status = :status', { status });
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim());
      queryBuilder.andWhere('contact.tags && :tags', { tags: tagArray });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated results
    const contacts = await queryBuilder
      .orderBy('contact.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, orgId?: string) {
    const queryBuilder = this.contactRepository
      .createQueryBuilder('contact')
      .where('contact.id = :id', { id })
      .andWhere('contact.deleted_at IS NULL');

    if (orgId) {
      queryBuilder.andWhere('contact.org_id = :orgId', { orgId });
    }

    const contact = await queryBuilder.getOne();

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    return {
      success: true,
      data: contact,
    };
  }

  async create(createContactDto: CreateContactDto, userId?: string) {
    try {
      // Check for duplicate email if provided
      if (createContactDto.email) {
        const existingContact = await this.contactRepository.findOne({
          where: {
            email: createContactDto.email,
            orgId: createContactDto.orgId,
            deletedAt: IsNull(),
          },
        });

        if (existingContact) {
          throw new BadRequestException('Contact with this email already exists');
        }
      }

      const contact = this.contactRepository.create({
        ...createContactDto,
        createdBy: userId,
        updatedBy: userId,
      });

      const savedContact = await this.contactRepository.save(contact);

      this.logger.log(`Contact created: ${savedContact.id} by user ${userId}`);

      return {
        success: true,
        data: savedContact,
        message: 'Contact created successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to create contact: ${error.message}`);
      throw error;
    }
  }

  async update(
    id: string,
    updateContactDto: UpdateContactDto,
    userId?: string,
    orgId?: string,
  ) {
    const contact = await this.contactRepository.findOne({
      where: {
        id,
        ...(orgId && { orgId }),
        deletedAt: IsNull(),
      },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    // Check for duplicate email if email is being updated
    if (updateContactDto.email && updateContactDto.email !== contact.email) {
      const existingContact = await this.contactRepository.findOne({
        where: {
          email: updateContactDto.email,
          orgId: contact.orgId,
          deletedAt: IsNull(),
        },
      });

      if (existingContact && existingContact.id !== id) {
        throw new BadRequestException('Contact with this email already exists');
      }
    }

    Object.assign(contact, {
      ...updateContactDto,
      updatedBy: userId,
    });

    const updatedContact = await this.contactRepository.save(contact);

    this.logger.log(`Contact updated: ${id} by user ${userId}`);

    return {
      success: true,
      data: updatedContact,
      message: 'Contact updated successfully',
    };
  }

  async remove(id: string, orgId?: string) {
    const contact = await this.contactRepository.findOne({
      where: {
        id,
        ...(orgId && { orgId }),
        deletedAt: IsNull(),
      },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    await this.contactRepository.softDelete(id);

    this.logger.log(`Contact soft deleted: ${id}`);

    return {
      success: true,
      message: 'Contact deleted successfully',
    };
  }

  async restore(id: string, orgId?: string) {
    const contact = await this.contactRepository.findOne({
      where: {
        id,
        ...(orgId && { orgId }),
      },
      withDeleted: true,
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    if (!contact.deletedAt) {
      throw new BadRequestException('Contact is not deleted');
    }

    await this.contactRepository.restore(id);

    this.logger.log(`Contact restored: ${id}`);

    return {
      success: true,
      message: 'Contact restored successfully',
    };
  }

  async autocomplete(query: string, orgId?: string) {
    const queryBuilder = this.contactRepository
      .createQueryBuilder('contact')
      .select([
        'contact.id',
        'contact.firstName',
        'contact.lastName',
        'contact.email',
        'contact.phone',
        'contact.companyName',
      ])
      .where('contact.deleted_at IS NULL')
      .andWhere(
        '(contact.first_name ILIKE :query OR contact.last_name ILIKE :query OR contact.email ILIKE :query)',
        { query: `%${query}%` },
      );

    if (orgId) {
      queryBuilder.andWhere('contact.org_id = :orgId', { orgId });
    }

    const contacts = await queryBuilder.take(10).getMany();

    return {
      success: true,
      data: contacts.map((c) => ({
        id: c.id,
        label: `${c.firstName} ${c.lastName}`,
        email: c.email,
        phone: c.phone,
        companyName: c.companyName,
      })),
    };
  }

  async exportToCsv(orgId?: string) {
    const queryBuilder = this.contactRepository
      .createQueryBuilder('contact')
      .where('contact.deleted_at IS NULL');

    if (orgId) {
      queryBuilder.andWhere('contact.org_id = :orgId', { orgId });
    }

    const contacts = await queryBuilder.getMany();

    // Simple CSV generation (in production, use a library like papaparse)
    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Type',
      'Status',
      'Company Name',
      'City',
      'State',
    ];

    const rows = contacts.map((c) => [
      c.firstName,
      c.lastName,
      c.email,
      c.phone,
      c.type,
      c.status,
      c.companyName,
      c.city,
      c.state,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    return {
      success: true,
      data: csv,
      message: 'Contacts exported successfully',
    };
  }

  async getStatistics(orgId?: string) {
    const queryBuilder = this.contactRepository
      .createQueryBuilder('contact')
      .where('contact.deleted_at IS NULL');

    if (orgId) {
      queryBuilder.andWhere('contact.org_id = :orgId', { orgId });
    }

    const total = await queryBuilder.getCount();
    const residential = await queryBuilder
      .clone()
      .andWhere('contact.type = :type', { type: 'residential' })
      .getCount();
    const commercial = await queryBuilder
      .clone()
      .andWhere('contact.type = :type', { type: 'commercial' })
      .getCount();
    const active = await queryBuilder
      .clone()
      .andWhere('contact.status = :status', { status: 'active' })
      .getCount();

    return {
      success: true,
      data: {
        total,
        residential,
        commercial,
        active,
        byType: {
          residential,
          commercial,
          propertyManager: await queryBuilder
            .clone()
            .andWhere('contact.type = :type', { type: 'property_manager' })
            .getCount(),
          referralPartner: await queryBuilder
            .clone()
            .andWhere('contact.type = :type', { type: 'referral_partner' })
            .getCount(),
        },
      },
    };
  }
}
