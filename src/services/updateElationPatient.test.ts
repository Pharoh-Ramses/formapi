import { expect, test, mock, beforeEach } from "bun:test";
import { updatePatient } from './updateElationPatient';
import { config } from '../config/env';

beforeEach(() => {
  // Mock getBearer to return a consistent token
  mock.module('./getElationBearer', () => ({
    getBearer: () => Promise.resolve('test-bearer-token')
  }));
  // Reset the fetch mock before each test
  global.fetch = mock(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  } as Response));
});

test("updatePatient calls the correct URL with all required parameters", async () => {
  const patientId = '123';
  await updatePatient(patientId, 'Doe', 'John', 'Male', '1986-08-21', 'Dr. Smith', 'General Hospital');
  
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith(
    `${config.apiUrl}/patients/${patientId}`,
    expect.objectContaining({
      method: 'PUT',
      headers: expect.objectContaining({
        'Authorization': 'Bearer test-bearer-token',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }),
      body: JSON.stringify({
        id: patientId,
        last_name: 'Doe',
        first_name: 'John',
        sex: 'Male',
        dob: '1986-08-21',
        primary_physician: 'Dr. Smith',
        caregiver_practice: 'General Hospital'
      }),
    })
  );
});

test("updatePatient returns correct response on successful update", async () => {
  const mockResponse = { id: '123', first_name: 'John', last_name: 'Doe' };
  global.fetch = mock(() => Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(mockResponse)
  } as Response));

  const result = await updatePatient('123', 'Doe', 'John', 'Male', '1986-08-21', 'Dr. Smith', 'General Hospital');
  expect(result.ok).toBe(true);
  expect(result.status).toBe(200);
  expect(await result.json()).toEqual(mockResponse);
});

test("updatePatient handles API failure", async () => {
  global.fetch = mock(() => Promise.resolve({
    ok: false,
    status: 400,
    json: () => Promise.resolve({ error: 'Bad Request' })
  } as Response));

  const result = await updatePatient('123', 'Doe', 'John', 'Male', '1986-08-21', 'Dr. Smith', 'General Hospital');
  expect(result.ok).toBe(false);
  expect(result.status).toBe(400);
  expect(await result.json()).toEqual({ error: 'Bad Request' });
});
