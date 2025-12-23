import { Injectable } from '@nestjs/common';

@Injectable()
export class OperationsService {
  async findAll() {
    return {
      success: true,
      data: [],
      message: 'Operations module - implementation pending',
    };
  }
}
