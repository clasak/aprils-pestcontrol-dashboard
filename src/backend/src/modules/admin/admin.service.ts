import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  async findAll() {
    return {
      success: true,
      data: [],
      message: 'Admin module - implementation pending',
    };
  }
}
