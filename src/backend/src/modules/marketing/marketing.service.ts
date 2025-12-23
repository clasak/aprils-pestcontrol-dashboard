import { Injectable } from '@nestjs/common';

@Injectable()
export class MarketingService {
  async findAll() {
    return {
      success: true,
      data: [],
      message: 'Marketing module - implementation pending',
    };
  }
}
