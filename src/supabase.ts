import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mxgqgpfbbaxvzscakipo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14Z3FncGZiYmF4dnpzY2FraXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjIyMjAsImV4cCI6MjA5Mjc5ODIyMH0.coJTSKeQeZX1ryCVketrOX1vNq9YyMnIp-hPlC_QgTs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
