import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
if (!process.env.SUPABASE_URL) {
  dotenv.config();
}

import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.SUPABASE_URL || '';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
export const isSupabaseEnabled = Boolean(supabaseUrl && supabaseKey);

if (!isSupabaseEnabled) {
  console.warn(
    '[SUPABASE CONFIG WARNING] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. ' +
    'The API is using its local JSON store; database changes will not be synchronized.'
  );
}

const supabase = isSupabaseEnabled
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export default supabase;
