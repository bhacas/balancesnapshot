import { test, expect } from '@playwright/test';
import { createTestUser } from '../helpers/auth';

test('can create an authenticated api context', async () => {
  const { apiContext, user } = await createTestUser();
  const res = await apiContext.get('/api/accounts');
  
  // The first request must pass
  expect(res.status()).not.toBe(401);
});
