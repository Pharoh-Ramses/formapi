import dotenv from 'dotenv';

dotenv.config();

export const patientConfig = {
    clientId: process.env.ELATION_CLIENT_ID,
    clientSecret: process.env.ELATION_CLIENT_SECRET,
    apiUrl: process.env.ELATION_URL_PATIENT,
}

export const messageConfig = {
    clientId: process.env.ELATION_CLIENT_ID,
    clientSecret: process.env.ELATION_CLIENT_SECRET,
    apiUrl: process.env.ELATION_URL_MESSAGES,
}
