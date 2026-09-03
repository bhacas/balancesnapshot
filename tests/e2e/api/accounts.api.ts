import { test, expect } from '@playwright/test';
import { createTestUser } from '../helpers/auth';

test.describe('Accounts API CRUD & Auth Boundaries', () => {
  let userA: Awaited<ReturnType<typeof createTestUser>>;
  let userB: Awaited<ReturnType<typeof createTestUser>>;

  test.beforeAll(async () => {
    userA = await createTestUser();
    userB = await createTestUser();
  });

  test('POST /api/accounts: enforces Zod validation (R-04)', async () => {
    const { apiContext } = userA;
    
    // Invalid type
    let res = await apiContext.post('/api/accounts', {
      data: { name: 'Test Account', type: 'invalid_type' }
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();

    // Valid asset
    res = await apiContext.post('/api/accounts', {
      data: { name: 'Asset Account', type: 'asset' }
    });
    expect(res.status()).toBe(201);
    const validBody = await res.json();
    expect(validBody.type).toBe('asset');
    expect(validBody.name).toBe('Asset Account');
  });

  test('DELETE /api/accounts/[id]: soft-deletes and filters from GET', async () => {
    const { apiContext } = userA;
    
    // Create an account
    const createRes = await apiContext.post('/api/accounts', {
      data: { name: 'To Be Deleted', type: 'liability' }
    });
    const account = await createRes.json();
    
    // DELETE it
    const deleteRes = await apiContext.delete(`/api/accounts/${account.id}`);
    expect(deleteRes.status()).toBe(200);

    // Verify GET filters it out by default
    let getRes = await apiContext.get('/api/accounts');
    let accounts = await getRes.json();
    expect(accounts.find((a: any) => a.id === account.id)).toBeUndefined();

    // Verify GET include_inactive returns it
    getRes = await apiContext.get('/api/accounts?include_inactive=true');
    accounts = await getRes.json();
    const deletedAcc = accounts.find((a: any) => a.id === account.id);
    expect(deletedAcc).toBeDefined();
    expect(deletedAcc.is_active).toBe(false);
  });

  test('Auth Boundaries: User B cannot edit or delete User A\'s accounts', async () => {
    const { apiContext: contextA } = userA;
    const { apiContext: contextB } = userB;

    // User A creates account
    const createRes = await contextA.post('/api/accounts', {
      data: { name: 'User A Private', type: 'asset' }
    });
    const accountA = await createRes.json();

    // User B tries to GET (should not see it)
    const getResB = await contextB.get('/api/accounts');
    const accountsB = await getResB.json();
    expect(accountsB.find((a: any) => a.id === accountA.id)).toBeUndefined();

    // User B tries to PUT
    const putRes = await contextB.put(`/api/accounts/${accountA.id}`, {
      data: { name: 'Hacked by B', type: 'asset' }
    });
    // Wait, the API router might return 500 or 400 if RLS hides it or if error occurs
    // Let's check what the API returns on PUT when not found or RLS blocks
    // Ideally it's a 404, or 401, or just doesn't update.
    // If it's a 400 because RLS failed to update, that's fine. 
    // We'll assert that the update didn't happen by fetching as User A again.
    
    const getResA = await contextA.get('/api/accounts');
    const accountsA = await getResA.json();
    const unchangedA = accountsA.find((a: any) => a.id === accountA.id);
    expect(unchangedA.name).toBe('User A Private');

    // User B tries to DELETE
    const delRes = await contextB.delete(`/api/accounts/${accountA.id}`);
    // Again, it might return 204 but RLS prevented deletion. Let's check if it still exists.
    
    const getResA2 = await contextA.get('/api/accounts');
    const accountsA2 = await getResA2.json();
    const stillThere = accountsA2.find((a: any) => a.id === accountA.id);
    expect(stillThere).toBeDefined();
  });
});
