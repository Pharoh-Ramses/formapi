import { config } from "../config/env";
import { getBearer } from "./getElationBearer";

interface ApiResponse {
    ok: boolean;
    status: number;
    json: () => Promise<any>;
}

export async function updatePatient(
    id: string,
    last_name: string,
    first_name: string,
    sex: string,
    dob: string,
    primary_physician: string,
    caregiver_practice: string,
): Promise<ApiResponse> {
    const bearerToken = await getBearer();

    const patientData = {
        id,
        last_name,
        first_name,
        sex,
        dob,
        primary_physician,
        caregiver_practice,
    };

    const response = await fetch(`${config.apiUrl}/patients/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${bearerToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(patientData),
    });

    return {
        ok: response.ok,
        status: response.status,
        json: () => response.json(),
    };
}
