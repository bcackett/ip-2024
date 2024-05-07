import { createClient } from "@supabase/supabase-js";
import { Database } from "./types/database";

const supabaseURL = process.env.SUPABASE_URL!.toString();
const supabaseKey = process.env.SUPABASE_KEY!.toString();

export const supabase = createClient<Database>(supabaseURL, supabaseKey);
