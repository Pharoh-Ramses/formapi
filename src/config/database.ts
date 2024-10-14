export const dbConfig = {
    host: "wp-db-cp-3.cwu3mxkvfhlh.us-west-2.rds.amazonaws.com",
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : undefined
}