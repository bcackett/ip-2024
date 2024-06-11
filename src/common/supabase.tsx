import { createClient } from "@supabase/supabase-js";
import { Database } from "./types/database";

// These keys are stored as environment variables for security purposes as this ensures no unwanted access to the database itself.
const supabaseURL = process.env.REACT_APP_SUPABASE_URL!.toString();
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY!.toString();

export const supabase = createClient<Database>(supabaseURL, supabaseKey); // Creating the instance of the client that allows the website to interface with the external database.
