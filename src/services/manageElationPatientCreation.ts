import { findPatient, PatientSearchParams } from "./findElationPatients";
import { createPatient } from "./createElationPatient";
import { updatePatient, PatientData, ApiResponse } from "./updateElationPatient";

export async function manageElationPatientCreation(patientData: Omit<PatientData, 'id'>) {
    try {
        const searchParams: PatientSearchParams = {
            last_name: patientData.last_name,
            first_name: patientData.first_name,
            dob: patientData.dob,
        };

        const existingPatients = await findPatient(searchParams);

        if (existingPatients.length > 0) {
            const existingPatient = existingPatients[0];
            const updatedPatientData: PatientData = {
                ...patientData,
                id: existingPatient.id
            };
            const updateResponse: ApiResponse = await updatePatient(updatedPatientData);
            
            if (updateResponse.ok) {
                const updatedPatient = await updateResponse.json();
                return {
                    action: "update",
                    patient: updatedPatient,
                };
            } else {
                throw new Error(`Failed to update patient. Status: ${updateResponse.status}`);
            }
        } else {
            const newPatient = await createPatient(patientData);
            return {
                action: "create",
                patient: newPatient,
            };
        }
    } catch (error) {
        console.error("Error in manageElationPatientCreation:", error);
        throw error;
    }
}
