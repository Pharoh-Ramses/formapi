import { config } from '../config/env';
import { getBearer } from './getElationBearer';

interface PatientData {
    last_name: string;
    first_name: string;
    sex: string;
    dob: string;
    primary_physician: string;
    caregiver_practice: string;
}

interface ApiResponse {
    ok: boolean;
    status: number;
    json: () => Promise<any>;
}

export async function createPatient(data: PatientData): Promise<ApiResponse> {
    const bearerToken = await getBearer();
    const response = await fetch(`${config.apiUrl}/patients/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return {
        ok: response.ok,
        status: response.status,
        json: () => response.json(),
    };
}
