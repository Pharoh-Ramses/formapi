import app from './app'

const port = 3030

console.log(`Server is starting...`)


export default {
    port: port,
    fetch: app.fetch,
}

console.log(`Server is running on port ${port}`)