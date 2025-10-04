// Script to create an admin user with specified credentials
document.addEventListener('DOMContentLoaded', async function() {
  const adminEmail = 'admin@example.com';
  const adminPassword = '12345678';
  const adminUsername = 'admin';
  
  try {
    // Initialize Supabase client
    const { createClient } = supabase;
    const supabaseUrl = 'https://nyjvbtqcghhlmrstthwf.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55anZidHFjZ2hobG1yc3R0aHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NzQ3MTAsImV4cCI6MjA3NTE1MDcxMH0.xOshYZzf43d0m-1F-g6C8F5YoQZDLgxWthil0Ub_5kg';
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    
    // Check if admin user already exists
    const { data: existingUsers, error: checkError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('username', adminUsername)
      .single();
      
    if (existingUsers) {
      console.log('Admin user already exists');
      return;
    }
    
    // Step 1: Register the admin user with Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          full_name: 'Administrator',
          username: adminUsername
        }
      }
    });
    
    if (authError) throw authError;
    
    // Step 2: Create a profile record in the profiles table with admin privileges
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert([
        { 
          id: authData.user.id,
          username: adminUsername,
          full_name: 'Administrator',
          email: adminEmail,
          phone: '123-456-7890',
          institution: 'BD Olympiad',
          is_admin: true,
          is_moderator: true,
          is_content_creator: true
        }
      ]);
    
    if (profileError) throw profileError;
    
    console.log('Admin user created successfully');
    
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  }
});