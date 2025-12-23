import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomerServiceService {
  async findAll() {
    return {
      success: true,
      data: [],
      message: 'Customer Service module - implementation pending',
    };
  }
}
