import { createClient } from "@supabase/supabase-js";

// process.env မရခဲ့ပါက တိုက်ရိုက် String Values များကို Fallback အဖြစ် သုံးမည်
const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  "https://udvnbhjsyeryczxvkafu.supabase.co";

const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkdm5iaGpzeWVyeWN6eHZrYWZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNjg2MDgsImV4cCI6MjEwNjk0NDYwOH0.O0atzR8IEoyTm-2YXx4dzf7OzIL8vgZyo7H99Oz97sE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
