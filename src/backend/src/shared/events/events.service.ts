import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventsService {
  constructor(private eventEmitter: EventEmitter2) {}

  emit(event: string, payload: any) {
    this.eventEmitter.emit(event, payload);
  }

  // Example event types for cross-module communication:
  // - 'lead.created' - When a new lead is created in Sales
  // - 'service.completed' - When a service is completed in Operations
  // - 'payment.received' - When payment is processed in Finance
  // - 'customer.updated' - When customer data is updated
}
