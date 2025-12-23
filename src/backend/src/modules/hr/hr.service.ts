import { Injectable } from '@nestjs/common';

@Injectable()
export class HrService {
  async findAll() {
    return {
      success: true,
      data: [],
      message: 'HR module - implementation pending',
    };
  }
}
