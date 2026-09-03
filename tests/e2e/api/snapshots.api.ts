import { test, expect } from '@playwright/test';
import { createTestUser } from '../helpers/auth';

test.describe('Snapshots API CRUD & Validation', () => {
  let user: Awaited<ReturnType<typeof createTestUser>>;
  let accountId: string;

  test.beforeAll(async () => {
    user = await createTestUser();
    
    // Create an account to use in snapshot tests
    const res = await user.apiContext.post('/api/accounts', {
      data: { name: 'Test Account', type: 'asset' }
    });
    const account = await res.json();
    accountId = account.id;
  });

  test('POST /api/snapshots: validates date safely (R-05)', async () => {
    const { apiContext } = user;
    
    // Invalid date string
    const resInvalid = await apiContext.post('/api/snapshots', {
      data: {
        date: 'not-a-valid-date',
        entries: [{ account_id: accountId, balance: 100 }]
      }
    });
    // Should return 400 Bad Request, NOT 500 Internal Server Error
    expect(resInvalid.status()).toBe(400);
    const errBody = await resInvalid.json();
    expect(errBody.error).toBeDefined();

    // Valid ISO date
    const resValid = await apiContext.post('/api/snapshots', {
      data: {
        date: new Date().toISOString(),
        entries: [{ account_id: accountId, balance: 250 }]
      }
    });
    expect(resValid.status()).toBe(201);
  });

  test('GET, PUT, DELETE /api/snapshots/[id]: standard operations', async () => {
    const { apiContext } = user;
    
    // Create
    let res = await apiContext.post('/api/snapshots', {
      data: {
        entries: [{ account_id: accountId, balance: 500 }]
      }
    });
    expect(res.status()).toBe(201);
    const snapshot = await res.json();
    expect(snapshot.id).toBeDefined();
    
    // GET
    res = await apiContext.get('/api/snapshots');
    expect(res.status()).toBe(200);
    const list = await res.json();
    expect(list.some((s: any) => s.id === snapshot.id)).toBe(true);

    // PUT
    res = await apiContext.put(`/api/snapshots/${snapshot.id}`, {
      data: {
        entries: [{ account_id: accountId, balance: 600 }]
      }
    });
    expect(res.status()).toBe(200);

    // DELETE
    res = await apiContext.delete(`/api/snapshots/${snapshot.id}`);
    expect(res.status()).toBe(204); // the snapshot API DELETE returned 204 originally, let's verify
  });
});
