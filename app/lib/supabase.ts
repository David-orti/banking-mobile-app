import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill';



const SUPABASE_URL = 'https://kalawdqbtixnkbcpbxgb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbGF3ZHFidGl4bmtiY3BieGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxODA0NjYsImV4cCI6MjA3OTc1NjQ2Nn0.zsWF91YOFKUmUs4iC_lHlIP1HEPZb34dNzyaFdRG5rA';

 export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);