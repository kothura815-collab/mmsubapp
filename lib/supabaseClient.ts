import { supabase } from "../lib/supabaseClient";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://udvnbhjsyeryczxvkafu.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "Sb_publishable_VPCP5PloNDTvm1lYp0_ZAw_KaaqZe2x";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
