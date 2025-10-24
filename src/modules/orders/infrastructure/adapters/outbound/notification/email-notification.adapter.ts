import { Injectable } from '@nestjs/common';
import { INotificationService } from '../../../../application/ports/outbound/notification.port';

@Injectable()
export class EmailNotificationAdapter implements INotificationService {
  async sendOrderConfirmation(
    orderId: string,
    customerEmail: string,
  ): Promise<void> {
    // Implementation for sending email
    console.log(
      `Sending order confirmation email for order ${orderId} to ${customerEmail}`,
    );
    // Integration with email service (SendGrid, AWS SES, etc.)
  }

  async sendOrderStatusUpdate(orderId: string, status: string): Promise<void> {
    console.log(`Sending order status update for order ${orderId}: ${status}`);
    // Integration with email service
  }
}
