import { createHmac } from 'node:crypto';
import { afterEach, describe, expect, it } from 'vitest';
import {
  getAppUrl,
  getStripeSubscriptionPriceId,
  inferPlanIdFromStripeSubscription,
  verifyStripeWebhookSignature,
  type StripeSubscriptionObject,
} from './server';

describe('verifyStripeWebhookSignature', () => {
  const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;

  afterEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
  });

  it('accepts a valid signature', () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';

    const payload = JSON.stringify({ id: 'evt_123', type: 'checkout.session.completed' });
    const timestamp = '1741435200';
    const signature = createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET)
      .update(`${timestamp}.${payload}`, 'utf8')
      .digest('hex');

    expect(verifyStripeWebhookSignature(payload, `t=${timestamp},v1=${signature}`)).toBe(true);
  });

  it('rejects an invalid signature', () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';

    const payload = JSON.stringify({ id: 'evt_123', type: 'checkout.session.completed' });

    expect(verifyStripeWebhookSignature(payload, 't=1741435200,v1=invalid')).toBe(false);
  });
});

describe('stripe helpers', () => {
  it('returns localhost app url by default', () => {
    expect(getAppUrl()).toBeTruthy();
  });

  it('infers plan id from subscription price', () => {
    const subscription: StripeSubscriptionObject = {
      id: 'sub_123',
      customer: 'cus_123',
      status: 'active',
      cancel_at_period_end: false,
      current_period_start: 1741435200,
      current_period_end: 1744027200,
      canceled_at: null,
      items: {
        data: [
          {
            price: {
              id: 'price_1T7jrvRtfeCjDhyDVDc0IyyU',
            },
          },
        ],
      },
    };

    expect(getStripeSubscriptionPriceId(subscription)).toBe('price_1T7jrvRtfeCjDhyDVDc0IyyU');
    expect(inferPlanIdFromStripeSubscription(subscription)).toBe('pro');
  });
});
