import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ Supabase URL or Service Role Key is missing from .env");
}

// In the backend, we typically use the Service Role Key to bypass RLS and act as admin,
// or we pass the user's JWT forward. We'll use service_role here to mimic the raw power of Mongoose
// but we will enforce user mapping in the queries.
export const supabase = createClient(supabaseUrl, supabaseKey);
