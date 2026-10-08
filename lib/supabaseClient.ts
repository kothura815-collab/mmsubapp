import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://udvnbhjsyeryczxvkafu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkdm5iaGpzeWVyeWN6eHZrYWZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNjg2MDgsImV4cCI6MjEwNjk0NDYwOH0.O0atzR8IEoyTm-2YXx4dzf7OzIL8vgZyo7H99Oz97sE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
