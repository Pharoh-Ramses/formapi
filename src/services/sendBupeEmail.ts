import { Resend } from 'resend'
import { CreateEmailResponseSuccess } from '../types/email'


const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBupeEmailtoAtlas(
    recipient: string,
    subject: string,
    text: string,
    pdfBuffer: Buffer,
    filename: string
): Promise<CreateEmailResponseSuccess | null> {
    {
        try {
            const {data, error} = await resend.emails.send({
                from: process.env.FROM_EMAIL || 'Acme <onboarding@resend.dev>', // Use environment variable
                to: [recipient],
                subject: subject,
                text: text,
                attachments: [
                    {
                        filename: filename,
                        content: pdfBuffer
                    }
                ]
            });

            if (error) {
                console.error('Error sending email:', error);
                throw new Error('Error sending email');
            }

            return data;
        } catch (error) {
            console.error('Error in sendEmailWithPDF:', error);
            throw error;
        }
    }
}