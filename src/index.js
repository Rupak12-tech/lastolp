const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://nyjvbtqcghhlmrstthwf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55anZidHFjZ2hobG1yc3R0aHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NzQ3MTAsImV4cCI6MjA3NTE1MDcxMH0.xOshYZzf43d0m-1F-g6C8F5YoQZDLgxWthil0Ub_5kg';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files with improved caching
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true
}));

// Authentication middleware
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Unauthorized - Authentication failed' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
    
    // Get user profile from Supabase to check admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    if (profileError || !profile || !profile.is_admin) {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(403).json({ error: 'Forbidden - Admin verification failed' });
  }
};

// API Routes
// User registration
app.post('/api/register', async (req, res) => {
  try {
    const { name, username, email, password, school, grade } = req.body;
    
    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          username
        }
      }
    });
    
    if (authError) {
      return res.status(400).json({ error: authError.message });
    }
    
    // Create user profile in Supabase database
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: authData.user.id,
          name,
          username,
          email,
          school,
          grade,
          is_admin: false
        }
      ]);
    
    if (profileError) {
      console.error('Profile creation error:', profileError);
      return res.status(500).json({ error: 'Failed to create user profile' });
    }
    
    res.status(201).json({ 
      message: 'User registered successfully', 
      userId: authData.user.id 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) {
      return res.status(401).json({ error: authError.message });
    }
    
    // Get user profile from Supabase
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
    
    res.json({
      message: 'Login successful',
      user: {
        id: authData.user.id,
        username: profile.username,
        name: profile.name,
        email: authData.user.email,
        isAdmin: profile.is_admin,
        token: authData.session.access_token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// User logout
app.post('/api/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return res.status(500).json({ error: 'Failed to logout' });
      }
    }
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

// Get current user
app.get('/api/user', requireAuth, async (req, res) => {
  try {
    // Get user profile from Supabase
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();
    
    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
    
    res.json({
      id: req.user.id,
      username: profile.username,
      name: profile.name,
      email: req.user.email,
      school: profile.school,
      grade: profile.grade,
      isAdmin: profile.is_admin
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
});

// Get competitions
app.get('/api/competitions', async (req, res) => {
  try {
    const { data: competitions, error } = await supabase
      .from('competitions')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) {
      console.error('Get competitions error:', error);
      return res.status(500).json({ error: 'Failed to get competitions' });
    }
    
    res.json(competitions);
  } catch (error) {
    console.error('Get competitions error:', error);
    res.status(500).json({ error: 'Failed to get competitions' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});