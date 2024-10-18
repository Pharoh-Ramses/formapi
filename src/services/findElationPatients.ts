import { config } from '../config/env';
import { getBearer } from './getElationBearer';

interface PatientSearchParams {
    first_name: string;
    last_name: string;
    dob: string;
}

interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    dob: string;
}

function paramsToRecord(params: PatientSearchParams): Record<string, string> {
    return Object.entries(params).reduce((acc, [key, value]) => {
        acc[key] = value.toString();
        return acc;
    }, {} as Record<string, string>);
}

export async function findPatient(searchParams: PatientSearchParams): Promise<Patient[]> {
    const bearerToken = await getBearer();
    const queryParams = new URLSearchParams(paramsToRecord(searchParams));
    const url = `${config.apiUrl}/patients/?${queryParams}`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Accept': 'application/json',
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Patient[] = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching patients:', error);
        throw error;
    }
}
