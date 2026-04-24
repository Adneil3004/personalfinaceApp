import { supabase } from './src/services/supabase';

async function checkCategories() {
  const { data: expenseCats, error: e1 } = await supabase.from('categories').select('*').eq('type', 'expense');
  const { data: incomeCats, error: e2 } = await supabase.from('categories').select('*').eq('type', 'income');
  
  console.log('Expense Categories:', expenseCats?.length);
  console.log('Income Categories:', incomeCats?.length);
  
  if (e1 || e2) console.error('Error:', e1 || e2);
}

checkCategories();
