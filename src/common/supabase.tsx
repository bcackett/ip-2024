import { createClient } from "@supabase/supabase-js";
import { Database } from "./types/database";

const supabaseURL = "https://aqqjgztwhbxvplrknpak.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxcWpnenR3aGJ4dnBscmtucGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIyNTA4NjQsImV4cCI6MjAyNzgyNjg2NH0.-SArLhRlQX3nwSGO5HtVkXIobXRcXP-FGXSPD-VY9yE";

export const supabase = createClient<Database>(supabaseURL, supabaseKey);
