import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://zgvdeitvfvocuvjslchw.supabase.co";

const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_cPOIwdKGrbg_8Npb2t8C1Q_bOifPO6y";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
