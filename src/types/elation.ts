// types/elation.ts

export interface ApiResponse {
    ok: boolean;
    status: number;
    json: () => Promise<any>;
}

export interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    sex: string;
    dob: string;
    primary_physician: string;
    caregiver_practice: string;
}

export interface CreateEmailResponseSuccess {
    id: string;
    message?: string;
    status?: string;
}

export type EmailResult = CreateEmailResponseSuccess | null;

export type PatientActionType = "create" | "update";

export interface ManagePatientResult {
    action: PatientActionType;
    patient: ApiResponse | Patient;
}

export interface BupeApiResponse {
    message: string;
    emailId: string;
    patientAction: PatientActionType;
    patientId: string;
}