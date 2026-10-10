import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('Supabase URL loaded:', !!supabaseUrl);
console.log('Supabase key loaded:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;