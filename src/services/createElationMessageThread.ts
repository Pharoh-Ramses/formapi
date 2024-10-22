import { messageConfig } from '../config/env';
import { getBearer } from './getElationBearer';

interface CreateMessageThread {
    patient: number;
    sender: number;
    practice: number;
    document_date: Date;
    chart_date: Date;
    members: ThreadMember[];
    messages: ThreadMessage[];
    is_urgent: boolean;
}

interface ThreadMember {
    id: number;
    status: string;
}

interface ThreadMessage {
    body: string;
    send_date: Date;
    sender: number;
}

export async function createElationMessageThread(createMessageThread: CreateMessageThread) {
    const bearerToken = await getBearer();
    const url = messageConfig.apiUrl;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'accept': 'application/json',
                'content-type': 'application/json'
            },
            body: JSON.stringify(createMessageThread)
        });
    if (!response.ok) {
        throw new Error(`Failed to create message thread: ${response.statusText}`);
    }

    return await response.json();
    } catch (error) {
        console.error('Error in createElationMessageThread:', error);
        throw error;
    }
}