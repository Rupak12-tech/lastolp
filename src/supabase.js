import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the same values as in public/js/supabase-config.js
const supabaseUrl = 'https://incngipsizayhzfcioik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluY25naXBzaXpheWh6ZmNpb2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjcxNzEsImV4cCI6MjA3NTE0MzE3MX0.HUqcS3j83QMvNB43TKJcmIxG_3A7MeFJ_evMSmpCWlY';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;