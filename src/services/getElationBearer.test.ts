import { expect, test, mock, beforeEach } from "bun:test";
import { getBearer } from './getElationBearer';

beforeEach(() => {
  // Reset the fetch mock before each test
  global.fetch = mock(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ access_token: 'test-bearer-token' })
  } as Response));
});

test("getBearer returns a token", async () => {
  const token = await getBearer();
  expect(token).toBe('test-bearer-token');
});

test.skip("getBearer throws on API error (401 Unauthorized)", async () => {
  global.fetch = mock(() => Promise.resolve({
    ok: false,
    status: 401,
    json: () => Promise.resolve({ error: "invalid_client" })
  } as Response));

  await expect(getBearer()).rejects.toThrow('Authentication failed: invalid_client');
});
