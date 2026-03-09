import { createClient } from '@supabase/supabase-js';

const url = 'https://bksebyxrknubyokwuaby.supabase.co';
const key = 'sb_publishable_uCGV11V8StEbCJne3I_6BA_vDOTrQ1A';

export const supabase = createClient(url, key);
