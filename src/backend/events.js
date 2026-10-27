import { orders } from 'wix-ecom-backend';
import { elevate } from 'wix-auth';

// DRAFT: Verify archive events and notification behavior on a test site before publishing.
export async function wixEcom_onOrderUpdated(event) {
  const changed = event?.entity;
  if (!changed?._id || changed.archived !== true) return;

  try {
    const order = await elevate(orders.getOrder)(changed._id);
    if (order.archived !== true || order.paymentStatus !== 'NOT_PAID' || order.status !== 'APPROVED') return;
    await elevate(orders.cancelOrder)(order._id, {
      sendOrderCanceledEmail: false,
      restockAllItems: false,
    });
    console.info('Archived unpaid order cancelled', order.number);
  } catch (error) {
    console.error('Archived order cancellation failed', changed._id, error);
  }
}
