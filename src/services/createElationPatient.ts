import { config } from '../config/env';
import { getBearer } from './getElationBearer';

interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    dob: string;
    sex: string;
    primary_physician: string;
    caregiver_practice: string;
    // Add other relevant fields
}

export async function createPatient(
    last_name: string,
    first_name: string,
    sex: string,
    date_of_birth: string,
    primary_physician: string,
    caregiver_practice: string
): Promise<Patient> {
    const bearerToken = await getBearer();
    const url = 'https://sandbox.elationemr.com/api/2.0/patients/';

    const patientData = {
        first_name,
        last_name,
        dob: date_of_birth,
        sex,
        primary_physician,
        caregiver_practice
    };

    try {
        console.log(`Creating patient with data:`, JSON.stringify(patientData, null, 2));
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patientData),
        });

        const responseBody = await response.text();
        console.log(`Response status: ${response.status}`);
        console.log(`Response body: ${responseBody}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, body: ${responseBody}`);
        }

        let data: Patient;
        try {
            data = JSON.parse(responseBody);
        } catch (e) {
            throw new Error(`Failed to parse JSON response: ${e}. Raw response: ${responseBody}`);
        }

        console.log(`Successfully created patient with ID: ${data.id}`);
        return data;
    } catch (error) {
        console.error('Error creating patient:', error);
        throw error;
    }
}
