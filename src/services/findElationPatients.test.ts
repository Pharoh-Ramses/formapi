import { expect, test, mock, beforeEach } from "bun:test";
import { findPatient } from './findElationPatients';
import * as bearerModule from './getElationBearer';
import { config } from '../config/env';

beforeEach(() => {
  // Mock getBearer to return a consistent token
  mock.module('./getElationBearer', () => ({
    getBearer: () => Promise.resolve('test-bearer-token')
  }));
  // Reset the fetch mock before each test
  global.fetch = mock(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  } as Response));
});

test("findPatient calls the correct URL with all required parameters", async () => {
  await findPatient('Doe', 'John', '1986-08-21');
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith(
    `${config.apiUrl}/patients/?last_name=Doe&first_name=John&dob=1986-08-21`,
    expect.objectContaining({
      method: 'GET',
      headers: expect.objectContaining({
        'Authorization': 'Bearer test-bearer-token',
        'Accept': 'application/json',
      }),
    })
  );
});

test("findPatient returns patient data on successful response", async () => {
  const mockPatientData = [
    { id: '123', first_name: 'John', last_name: 'Doe', dob: '1986-08-21' }
  ];
  global.fetch = mock(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockPatientData)
  } as Response));
  const result = await findPatient('Doe', 'John', '1986-08-21');
  expect(result).toEqual(mockPatientData);
});

test("findPatient throws an error on API failure", async () => {
  global.fetch = mock(() => Promise.resolve({
    ok: false,
    status: 404,
  } as Response));
  await expect(findPatient('Doe', 'John', '1986-08-21'))
    .rejects.toThrow('HTTP error! status: 404');
});

test("findPatient handles empty response correctly", async () => {
  global.fetch = mock(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  } as Response));
  const result = await findPatient('Doe', 'John', '1986-08-21');
  expect(result).toEqual([]);
});
