import { createClient } from "@supabase/supabase-js";
import { Database } from "./types/database";

const supabaseURL = process.env.REACT_APP_SUPABASE_URL!.toString();
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY!.toString();

export const supabase = createClient<Database>(supabaseURL, supabaseKey);
