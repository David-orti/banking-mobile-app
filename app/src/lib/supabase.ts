import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill';



const SUPABASE_URL = 'https://lqqhlmgjyldkpzudfhdz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxcWhsbWdqeWxka3B6dWRmaGR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTc0NzUsImV4cCI6MjA3OTg3MzQ3NX0.ygqVOisKkHB_TR5mrE-_bffGy3KlvxZxAohcM_7wqXE';

 export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);