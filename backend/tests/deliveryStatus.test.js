import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDeliveryStatusTransition } from '../src/utils/deliveryStatus.js';
import { buildAdminAnalytics } from '../src/utils/adminAnalytics.js';

test('allows the documented delivery workflow', () => {
  assert.equal(validateDeliveryStatusTransition('ASSIGNED', 'IN_TRANSIT'), 'IN_TRANSIT');
  assert.equal(validateDeliveryStatusTransition('IN_TRANSIT', 'OUT_FOR_DELIVERY'), 'OUT_FOR_DELIVERY');
  assert.equal(validateDeliveryStatusTransition('OUT_FOR_DELIVERY', 'DELIVERED'), 'DELIVERED');
});

test('requires a reason when a delivery attempt fails', () => {
  assert.throws(
    () => validateDeliveryStatusTransition('ASSIGNED', 'FAILED'),
    /failureReason is strictly mandatory/
  );
  assert.equal(validateDeliveryStatusTransition('ASSIGNED', 'FAILED', 'Recipient unavailable'), 'FAILED');
});

test('rejects skipped, repeated, and terminal transitions', () => {
  assert.throws(() => validateDeliveryStatusTransition('ASSIGNED', 'DELIVERED'), /Invalid delivery status transition/);
  assert.throws(() => validateDeliveryStatusTransition('DELIVERED', 'IN_TRANSIT'), /Invalid delivery status transition/);
  assert.throws(() => validateDeliveryStatusTransition('CANCELLED', 'ASSIGNED'), /Invalid delivery status transition/);
});

test('builds weekly and monthly analytics from stored parcel dates and costs', () => {
  const now = new Date('2026-10-24T12:00:00.000Z');
  const stats = buildAdminAnalytics({
    users: [{ role: 'customer' }, { role: 'employee' }],
    complaints: [{ status: 'OPEN' }, { status: 'RESOLVED' }],
    parcels: [
      {
        status: 'DELIVERED',
        bookingDate: '2026-10-23T12:00:00.000Z',
        deliveredDate: '2026-10-24T08:00:00.000Z',
        cost: 50,
      },
      {
        status: 'FAILED',
        bookingDate: '2026-10-01T12:00:00.000Z',
        history: [{ status: 'DELIVERED', timestamp: '2026-10-03T08:00:00.000Z' }],
        cost: 75,
      },
      { status: 'PENDING', bookingDate: '2026-04-01T00:00:00.000Z', cost: 20 },
    ],
  }, now);

  assert.equal(stats.totalCustomers, 1);
  assert.equal(stats.totalEmployees, 1);
  assert.equal(stats.totalParcels, 3);
  assert.equal(stats.totalRevenue, 145);
  assert.equal(stats.openComplaints, 1);
  assert.equal(stats.deliverySuccessRate, 50);
  assert.equal(stats.weeklyVolume.length, 7);
  assert.equal(stats.weeklyVolume.find((day) => day.day === 'Fri').bookings, 1);
  assert.equal(stats.weeklyVolume.find((day) => day.day === 'Sat').delivered, 1);
  assert.deepEqual(stats.monthlyVolume.map((month) => month.parcels), [0, 0, 0, 0, 0, 2]);
  assert.deepEqual(stats.monthlyVolume.map((month) => month.revenue), [0, 0, 0, 0, 0, 125]);
});

test('returns zero success rate when no delivery attempts have completed', () => {
  const stats = buildAdminAnalytics({ users: [], parcels: [], complaints: [] }, new Date('2026-10-24T12:00:00Z'));
  assert.equal(stats.deliverySuccessRate, 0);
});
