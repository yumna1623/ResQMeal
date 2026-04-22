import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cjreliykpkmnapekcqgi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqcmVsaXlrcGttbmFwZWtjcWdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2OTUyMzEsImV4cCI6MjA5MDI3MTIzMX0.eWrn6xbMD1sflr1X8QRaC6uOHmIZQN8_WaC0PWtoOEM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);