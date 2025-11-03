import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vjrjgccsvyrpyayuysoa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqcmpnY2NzdnlycHlheXV5c29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTc4MTcsImV4cCI6MjA3NjE3MzgxN30.nneP3eCZEtXWQqiTwbC1voJFLxuSsGJygu_sLfy9BOU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);