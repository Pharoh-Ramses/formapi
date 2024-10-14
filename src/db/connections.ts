import { Pool } from 'pg'
import {dbConfig} from '../config/database'

export const pool = new Pool(dbConfig)