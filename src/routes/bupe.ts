import { Hono } from 'hono'
import {logger} from 'hono/logger'
import {getbupeIntakeById} from '../services/getBupeData.ts'
import {generatePDF} from "../services/bupePdfService.ts";
import {sendBupeEmailtoAtlast} from "../services/sendBupeEmail.ts";

const bupe = new Hono()

bupe.use('*', logger())

bupe.get('/', (c) => c.json({ message: 'Welcome to the bupe route!' }))

bupe.get('/:eventId', async (c) => {
    const eventId = c.req.param('eventId')
    console.log(`Handling GET request to /bupe/${eventId}`)

    try {
        const event = await getbupeIntakeById(eventId)
        if (event) {
            const pdfBuffer = await generatePDF(event)

            // Send email using the email service
            const emailResult = await sendBupeEmailtoAtlast(
                process.env.ATLAS_EMAIL || 'recipient@example.com',
                `Bupe Intake Report - Event ${eventId}`,
                `Please find attached the bupe intake report for event ${eventId}.`,
                pdfBuffer,
                `bupe_intake_${eventId}.pdf`
            );

            return c.json({ message: 'Email sent successfully with PDF attachment', id: emailResult.id }, 200)
        } else {
            return c.json({ message: 'Event not found' }, 404)
        }
    } catch (error) {
        console.error(`Error fetching event, generating pdf, or sending email for: ${eventId}`, error)
        return c.json({ message: 'Internal server error' }, 500)
    }
})

export default bupe