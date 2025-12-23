import { Injectable } from '@nestjs/common';

@Injectable()
export class FinanceService {
  async findAll() {
    return {
      success: true,
      data: [],
      message: 'Finance module - implementation pending',
    };
  }
}
