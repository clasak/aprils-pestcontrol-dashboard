import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardsService {
  async findAll() {
    return {
      success: true,
      data: [],
      message: 'Dashboards module - implementation pending',
    };
  }
}
