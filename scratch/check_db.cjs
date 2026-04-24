const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uhktkekrgkldozrxfxrm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoa3RrZWtyZ2tsZG96cnhmeHJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5ODc3NTEsImV4cCI6MjA5MjU2Mzc1MX0.HgogGxrryodiN8qwRxUT0vIILOfOTt5Xa3xKw9cveOQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const userId = 'ab6bd8c3-5cec-4021-9f78-c8d9fc934579';

async function checkData() {
  console.log('Checking categories for user:', userId);
  const { data: cats, error: catError } = await supabase.from('categories').select('*').eq('user_id', userId);
  if (catError) console.error('Error fetching categories:', catError);
  else console.log('Categories found:', cats ? cats.length : 0);

  console.log('Checking accounts for user:', userId);
  const { data: accs, error: accError } = await supabase.from('accounts').select('*').eq('user_id', userId);
  if (accError) console.error('Error fetching accounts:', accError);
  else console.log('Accounts found:', accs ? accs.length : 0);
  
  if (accs && accs.length > 0) {
      accs.forEach(a => console.log(`Account: ${a.name}, Currency: ${a.currency}`));
  }
}

checkData();
