import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { getbupeIntakeById } from '../services/getBupeData'
import { generatePDF } from "../services/bupePdfService"
import { sendBupeEmailtoAtlast } from "../services/sendBupeEmail"
import { manageElationPatientCreation } from "../services/manageElationPatientCreation"

const bupe = new Hono()

bupe.use('*', logger())

bupe.get('/', (c) => c.json({ message: 'Welcome to the bupe route!' }))

bupe.get('/:eventId', async (c) => {
    const eventId = c.req.param('eventId')
    console.log(`Handling GET request to /bupe/${eventId}`)
    try {
        const event = await getbupeIntakeById(eventId)
        if (event) {
            // Generate and send PDF
            const pdfBuffer = await generatePDF(event)
            const emailResult = await sendBupeEmailtoAtlast(
                process.env.ATLAS_EMAIL || 'recipient@example.com',
                `Bupe Intake Report - Event ${eventId}`,
                `Please find attached the bupe intake report for event ${eventId}.`,
                pdfBuffer,
                `bupe_intake_${eventId}.pdf`
            )

            // Create or update patient in Elation
            const patientResult = await manageElationPatientCreation(
                event.last_name,
                event.first_name,
                event.sex,
                event.date_of_birth,
                event.primary_physician, 
                event.caregiver_practice,
            )

            return c.json({
                message: 'Email sent successfully with PDF attachment and patient managed in Elation',
                emailId: emailResult.id,
                patientAction: patientResult.action,
                patientId: patientResult.patient.id
            }, 200)
        } else {
            return c.json({ message: 'Event not found' }, 404)
        }
    } catch (error) {
        console.error(`Error processing event ${eventId}:`, error)
        return c.json({ message: 'Internal server error' }, 500)
    }
})

export default bupe
