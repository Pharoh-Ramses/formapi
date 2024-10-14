import { Hono } from 'hono'
import {logger} from 'hono/logger'
import bupe from './routes/bupe'

const app = new Hono()

app.use('*', logger())

app.route('/bupe', bupe)

app.get('/', (c) => {
    console.log('Handling GET request to root')
    return c.text('Welcome to the API!')
})

export default app