const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uhktkekrgkldozrxfxrm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoa3RrZWtyZ2tsZG96cnhmeHJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5ODc3NTEsImV4cCI6MjA5MjU2Mzc1MX0.HgogGxrryodiN8qwRxUT0vIILOfOTt5Xa3xKw9cveOQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
  console.log('Checking all categories...');
  const { data: cats, error: catError } = await supabase.from('categories').select('count', { count: 'exact' });
  if (catError) console.error('Error fetching categories:', catError);
  else console.log('Total categories in DB:', cats);

  console.log('Checking all accounts...');
  const { data: accs, error: accError } = await supabase.from('accounts').select('count', { count: 'exact' });
  if (accError) console.error('Error fetching accounts:', accError);
  else console.log('Total accounts in DB:', accs);
}

checkData();
