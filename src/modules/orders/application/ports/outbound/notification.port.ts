export interface INotificationService {
  sendOrderConfirmation(orderId: string, customerEmail: string): Promise<void>;
  sendOrderStatusUpdate(orderId: string, status: string): Promise<void>;
}

export const NOTIFICATION_SERVICE = Symbol('INotificationService');
