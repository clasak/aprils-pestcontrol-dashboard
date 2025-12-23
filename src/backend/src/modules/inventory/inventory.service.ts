import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoryService {
  async findAll() {
    return {
      success: true,
      data: [],
      message: 'Inventory module - implementation pending',
    };
  }
}
