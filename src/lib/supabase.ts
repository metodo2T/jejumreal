import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ussvkthtsayznnfslplw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzc3ZrdGh0c2F5em5uZnNscGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDY0NDIsImV4cCI6MjA4ODgyMjQ0Mn0.YEJN4q-vo45Lqz5Ms6hlGPo3ELKAYKqQLfTNZA8pFuM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
