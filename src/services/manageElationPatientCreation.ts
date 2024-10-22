import { findElationPatients } from "./findElationPatients";
import { createPatient } from "./createElationPatient";
import { updatePatient } from "./updateElationPatient";
import { formatDate } from "../utils/formatDate";
import { ManagePatientResult, PatientActionType } from '../types/elation';

export async function manageElationPatientCreation(
    last_name: string,
    first_name: string,
    sex: string,
    date_of_birth: string,
    primary_physician: string,
    caregiver_practice: string
): Promise<ManagePatientResult> {
    try {
        console.log(`Received date of birth:`, date_of_birth);
        const formattedDateOfBirth = formatDate(date_of_birth);
        console.log(`Formatted date of birth:`, formattedDateOfBirth);

        if (!formattedDateOfBirth) {
            throw new Error(`Invalid date of birth: ${date_of_birth}`);
        }

        console.log(`Searching for patient: ${last_name}, ${first_name}, Date of Birth: ${formattedDateOfBirth}`);
        const existingPatients = await findElationPatients(last_name, first_name, formattedDateOfBirth);

        if (existingPatients.length > 0) {
            console.log(`Found existing patient(s): ${existingPatients.length}`);
            const existingPatient = existingPatients[0];
            console.log(`Updating patient with ID: ${existingPatient.id}`);
            const updatedPatient = await updatePatient(
                existingPatient.id,
                last_name,
                first_name,
                sex,
                formattedDateOfBirth,
                primary_physician,
                caregiver_practice
            );

            const result: ManagePatientResult = {
                action: "update" as PatientActionType,
                patient: updatedPatient,
            };
            return result;
        } else {
            console.log("No existing patient found. Creating new patient.");
            const newPatient = await createPatient(
                last_name,
                first_name,
                sex,
                formattedDateOfBirth,
                primary_physician,
                caregiver_practice
            );

            const result: ManagePatientResult = {
                action: "create" as PatientActionType,
                patient: newPatient,
            };
            return result;
        }
    } catch (error) {
        console.error("Error in manageElationPatientCreation:", error);
        throw error;
    }
}