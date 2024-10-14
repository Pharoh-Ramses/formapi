import { pool } from '../db'
import { BupeIntake } from '../models/bupeIntake'

export async function getbupeIntakeById(id: string): Promise<BupeIntake | null> {
    const result = await pool.query('SELECT * FROM rumex.bupe_intake WHERE event_id = $1', [id])
    return result.rows[0] || null
}