import { findElationPatients } from "./findElationPatients";
import { createPatient } from "./createElationPatient";
import { updatePatient } from "./updateElationPatient";
import { formatDate } from "../utils/formatDate";

export async function manageElationPatientCreation(
    last_name: string,
    first_name: string,
    sex: string,
    date_of_birth: string | Date | undefined,
    primary_physician: string,
    caregiver_practice: string
) {
    try {
        console.log(`Received date of birth:`, date_of_birth);
        
        if (date_of_birth === undefined || date_of_birth === null) {
            throw new Error('Date of birth is missing');
        }

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
            
            return {
                action: "update",
                patient: updatedPatient,
            };
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
