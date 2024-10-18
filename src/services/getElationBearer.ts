import { config } from '../config/env';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ErrorResponse {
  error: string;
}

export async function getBearer(): Promise<string> {
  const url = `${config.apiUrl}/oauth2/token/`;
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' })
  };

  const response = await fetch(url, options);
  const data: TokenResponse | ErrorResponse = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(`Authentication failed: ${(data as ErrorResponse).error}`);
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return (data as TokenResponse).access_token;
}
