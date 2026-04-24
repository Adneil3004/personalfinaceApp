import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixBalances() {
  console.log('--- Buscando cuentas de crédito con saldo inicial positivo ---');
  
  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('id, name, initial_balance, type')
    .eq('type', 'credit')
    .gt('initial_balance', 0);

  if (error) {
    console.error('Error fetching accounts:', error);
    return;
  }

  if (!accounts || accounts.length === 0) {
    console.log('No se encontraron cuentas de crédito con saldo inicial positivo.');
    return;
  }

  console.log(`Se encontraron ${accounts.length} cuentas para corregir.`);

  for (const acc of accounts) {
    const newBalance = -Math.abs(acc.initial_balance);
    console.log(`Corrigiendo "${acc.name}": ${acc.initial_balance} -> ${newBalance}`);
    
    const { error: updateError } = await supabase
      .from('accounts')
      .update({ initial_balance: newBalance })
      .eq('id', acc.id);

    if (updateError) {
      console.error(`Error actualizando "${acc.name}":`, updateError);
    }
  }

  console.log('--- Proceso finalizado ---');
}

fixBalances();
