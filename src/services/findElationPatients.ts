import { getBearer } from './getElationBearer';

interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    dob: string;  // Changed to dob for Elation API
    // Add other relevant fields
}

interface ElationResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Patient[];
}

export async function findElationPatients(lastName: string, firstName: string, dateOfBirth: string): Promise<Patient[]> {
    const bearerToken = await getBearer();
    const baseUrl = 'https://sandbox.elationemr.com/api/2.0/patients/';
    
    const url = new URL(baseUrl);
    if (firstName) url.searchParams.append('first_name', firstName);
    if (lastName) url.searchParams.append('last_name', lastName);
    if (dateOfBirth) url.searchParams.append('dob', dateOfBirth);  // Changed to dob for Elation API

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Accept': 'application/json'
        }
    };

    try {
        console.log(`Fetching patients with URL: ${url.toString()}`);
        const response = await fetch(url.toString(), options);
        
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Error response body: ${errorBody}`);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }

        const data: ElationResponse = await response.json();
        console.log('API Response:', JSON.stringify(data, null, 2));

        console.log(`Found ${data.count} matching patients`);
        return data.results;
    } catch (error) {
        console.error('Error fetching patients:', error);
        throw error;
    }
}
