import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { getbupeIntakeById } from '../services/getBupeData'
import { generatePDF } from "../services/bupePdfService"
import { sendBupeEmailtoAtlas } from "../services/sendBupeEmail"
import { manageElationPatientCreation } from "../services/manageElationPatientCreation"
import {
    ManagePatientResult,
    EmailResult,
    BupeApiResponse,
    ApiResponse,
    Patient,
    PatientActionType
} from '../types/elation'

interface BupeEvent {
    last_name: string;
    first_name: string;
    sex: string;
    date_of_birth: string;
    primary_physician: string;
    caregiver_practice: string;
}

function isValidBupeEvent(event: any): event is BupeEvent {
    return (
        typeof event === 'object' &&
        typeof event.last_name === 'string' &&
        typeof event.first_name === 'string' &&
        typeof event.sex === 'string' &&
        typeof event.date_of_birth === 'string' &&
        typeof event.primary_physician === 'string' &&
        typeof event.caregiver_practice === 'string'
    );
}

const bupe = new Hono()
bupe.use('*', logger())

bupe.get('/', (c) => c.json({ message: 'Welcome to the bupe route!' }))

bupe.get('/:eventId', async (c) => {
    const { eventId } = c.req.param()
    console.log(`Handling GET request to /bupe/${eventId}`)

    try {
        const event = await getbupeIntakeById(eventId)
        if (!event) {
            return c.json({ message: 'Event not found' }, 404)
        }

        // Validate event data
        if (!isValidBupeEvent(event)) {
            return c.json({
                message: 'Invalid event data: missing required fields'
            }, 400)
        }


        // Generate and send PDF
        const pdfBuffer = await generatePDF(event)

        // Create or update patient in Elation
        const patientResult = await manageElationPatientCreation(
            event.last_name,
            event.first_name,
            event.sex,
            event.date_of_birth,
            event.primary_physician,
            event.caregiver_practice,
        )

        function isPatientActionType(action: string): action is PatientActionType {
            return action === 'create' || action === 'update';
        }

        if (!isPatientActionType(patientResult.action)) {
            throw new Error('Invalid patient action type');
        }

        // Get the patient ID based on the response type
        let patientId: string;
        if ('json' in patientResult.patient) {
            const patientData = await (patientResult.patient as ApiResponse).json();
            patientId = patientData.id;
        } else {
            patientId = (patientResult.patient as Patient).id;
        }

        // Send email with PDF attachment
        const emailResult = await sendBupeEmailtoAtlas(
            process.env.ATLAS_EMAIL || 'recipient@example.com',
            `Bupe Intake Report - Event ${eventId}`,
            `Please find attached the bupe intake report for event ${eventId}.`,
            pdfBuffer,
            `bupe_intake_${eventId}.pdf`
        )

        if (!emailResult) {
            throw new Error('Failed to send email')
        }

        const response: BupeApiResponse = {
            message: 'Email sent successfully with PDF attachment and patient managed in Elation',
            emailId: emailResult.id,
            patientAction: patientResult.action, // Now TypeScript knows this is PatientActionType
            patientId
        }

        return c.json(response, 200)

    } catch (error) {
        console.error(`Error processing event ${eventId}:`, error)
        return c.json({
            message: error instanceof Error ? error.message : 'Internal server error'
        }, 500)
    }
})

export default bupe