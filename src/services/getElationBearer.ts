import dotenv from "dotenv";

dotenv.config();

interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}

export async function getBearer(): Promise<string> {
    const url = "https://sandbox.elationemr.com/api/2.0/oauth2/token/";

    const formData = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.ELATION_CLIENT_ID || "",
        client_secret: process.env.ELATION_CLIENT_SECRET || "",
    });

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: TokenResponse = await response.json();

        if (!data.access_token) {
            throw new Error("No access token in response");
        }

        return data.access_token;
    } catch (error) {
        console.error("Error fetching bearer token:", error);
        throw error;
    }
}
