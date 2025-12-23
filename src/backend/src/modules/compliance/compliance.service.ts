import { Injectable } from '@nestjs/common';

@Injectable()
export class ComplianceService {
  async findAll() {
    return {
      success: true,
      data: [],
      message: 'Compliance module - implementation pending',
    };
  }
}
