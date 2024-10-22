export interface CreateEmailResponseSuccess {
    id: string;
    message?: string;
    status?: string;
}

export interface BupeApiResponse {
    message: string;
    emailId: string;
    patientAction: "create" | "update";
    patientId?: string;
}

export type EmailResult = CreateEmailResponseSuccess | null;