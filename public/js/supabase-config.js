// Supabase configuration
const supabaseUrl = 'https://nyjvbtqcghhlmrstthwf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55anZidHFjZ2hobG1yc3R0aHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NzQ3MTAsImV4cCI6MjA3NTE1MDcxMH0.xOshYZzf43d0m-1F-g6C8F5YoQZDLgxWthil0Ub_5kg';

// Create a single instance of the Supabase client to be used across the application
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);