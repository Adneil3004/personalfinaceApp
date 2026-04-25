import { supabase } from './supabase';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  parent_id?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'cash' | 'credit';
  currency: string;
  initial_balance: number;
  credit_limit?: number;
  is_active?: boolean;
  current_balance?: number; // calculado
}

export interface Transaction {
  id?: string;
  account_id: string;
  category_id: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  date: string;
  description?: string;
  
  // Relations when fetched
  categories?: { name: string; icon: string; color: string };
  accounts?: { name: string };
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  amount: number;
  type: 'income' | 'expense';
  frequency: 'monthly' | 'weekly' | 'yearly';
  next_execution_date: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Relations when fetched
  categories?: { name: string; icon: string; color: string };
  accounts?: { name: string };
}

export const api = {
  // --- Categories ---
  async getCategories(type?: 'income' | 'expense'): Promise<Category[]> {
    let query = supabase.from('categories').select('*').order('name');
    if (type) {
      query = query.eq('type', type);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as Category[];
  },

  // --- Accounts ---
  async getAccounts(): Promise<Account[]> {
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')
      .order('name');
    if (error) throw error;

    // Calculate current_balance = initial_balance +/- transactions
    const { data: transactions, error: tErr } = await supabase
      .from('transactions')
      .select('account_id, amount, type, description');
    if (tErr) throw tErr;

    return (accounts as Account[]).map(acc => {
      const transSum = (transactions || [])
        .filter(t => t.account_id === acc.id)
        .reduce((sum, t) => {
          if (t.type === 'transfer') {
            const isOut = t.description?.toLowerCase().includes('enviada');
            return sum + (isOut ? -Number(t.amount) : Number(t.amount));
          }
          return sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount));
        }, 0);
      return { ...acc, current_balance: Number(acc.initial_balance) + transSum };
    });
  },

  async createAccount(data: Omit<Account, 'id' | 'current_balance'>): Promise<Account> {
    const accountData = { ...data };
    
    // Normalización de saldos para crédito (siempre negativos)
    if (accountData.type === 'credit' && accountData.initial_balance > 0) {
      accountData.initial_balance = -Math.abs(accountData.initial_balance);
    }

    const { data: created, error } = await supabase
      .from('accounts')
      .insert([accountData])
      .select()
      .single();
    if (error) throw error;
    return created as Account;
  },

  async updateAccount(id: string, data: Partial<Omit<Account, 'id' | 'current_balance'>>): Promise<void> {
    const updateData = { ...data };

    // Si se está actualizando el saldo o el tipo, asegurar consistencia
    if (updateData.type === 'credit' || (updateData.initial_balance !== undefined)) {
      // Necesitamos el tipo actual si no viene en el update
      let typeToUse = updateData.type;
      if (!typeToUse) {
        const { data: acc } = await supabase.from('accounts').select('type').eq('id', id).single();
        typeToUse = acc?.type;
      }

      if (typeToUse === 'credit' && updateData.initial_balance !== undefined && updateData.initial_balance > 0) {
        updateData.initial_balance = -Math.abs(updateData.initial_balance);
      }
    }

    const { error } = await supabase.from('accounts').update(updateData).eq('id', id);
    if (error) throw error;
  },

  async deleteAccount(id: string): Promise<void> {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) throw error;
  },

  async getAccountsStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: accounts, error: accErr } = await supabase
      .from('accounts')
      .select('id, initial_balance, credit_limit, type, is_active');
    if (accErr) throw accErr;

    const { data: transactions, error: tErr } = await supabase
      .from('transactions')
      .select('account_id, amount, type, date, description');
    if (tErr) throw tErr;

    const txns = transactions || [];
    const accs = accounts || [];

    let totalAssets = 0; // checking + cash
    let totalDebt = 0;   // credit

    accs.forEach(acc => {
      const delta = txns
        .filter(t => t.account_id === acc.id)
        .reduce((s, t) => {
          if (t.type === 'transfer') {
            const isOut = t.description?.toLowerCase().includes('enviada');
            return s + (isOut ? -Number(t.amount) : Number(t.amount));
          }
          return s + (t.type === 'income' ? Number(t.amount) : -Number(t.amount));
        }, 0);
      
      const balance = Number(acc.initial_balance) + delta;

      if (acc.type === 'credit') {
        totalDebt += balance;
      } else {
        totalAssets += balance;
      }
    });

    const totalIncome = txns
      .filter(t => t.type === 'income' && t.date >= startOfMonth)
      .reduce((s, t) => s + Number(t.amount), 0);

    const totalExpenses = txns
      .filter(t => t.type === 'expense' && t.date >= startOfMonth)
      .reduce((s, t) => s + Number(t.amount), 0);

    const monthlySavings = totalIncome - totalExpenses;

    const creditLimit = accs
      .filter(a => a.type === 'credit')
      .reduce((s, a) => s + Number(a.credit_limit || 0), 0);

    return { 
      totalAssets, 
      totalDebt, 
      netWorth: totalAssets + totalDebt,
      totalIncome, 
      totalExpenses, 
      monthlySavings, 
      creditLimit 
    };
  },

  // --- Transactions ---
  async getTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (name, icon, color),
        accounts (name)
      `)
      .order('date', { ascending: false });
      
    if (error) throw error;
    return data as Transaction[];
  },

  async createTransaction(transaction: Transaction): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();
      
    if (error) throw error;
    return data as Transaction;
  },

  // --- Dashboard & Stats ---
  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Get Total Balance (Sum of all accounts)
    const { data: accounts, error: accError } = await supabase.from('accounts').select('id, name, initial_balance, type, credit_limit');
    if (accError) throw accError;
    
    // In a real app, you'd also sum transactions per account. 
    // For now, let's get the transaction totals.
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('amount, type, date, description, account_id, categories(name)')
      .order('date', { ascending: false });
    
    if (transError) throw transError;

    const flattenedTransactions = transactions?.map(t => ({
      ...t,
      category_name: (t.categories as any)?.name || 'Sin categoría'
    })) || [];

    // Calculate balances per account
    const accountColors = ['#00A3E0', '#316ee9', '#002D72', '#81cfff', '#039855', '#D92D20', '#FDB022'];
    const accountBalances = accounts?.map((acc, index) => {
      const balanceSum = flattenedTransactions
        .filter(t => t.account_id === acc.id)
        .reduce((sum, t) => {
          if (t.type === 'transfer') {
            const isOut = t.description?.toLowerCase().includes('enviada');
            return sum + (isOut ? -Number(t.amount) : Number(t.amount));
          }
          return sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount));
        }, 0);
      
      return {
        name: acc.name,
        balance: Number(acc.initial_balance) + balanceSum,
        color: accountColors[index % accountColors.length]
      };
    }) || [];

    const totalAssets = accountBalances
      .filter((_, i) => accounts[i].type !== 'credit')
      .reduce((acc, curr) => acc + curr.balance, 0);

    const totalDebt = accountBalances
      .filter((_, i) => accounts[i].type === 'credit')
      .reduce((acc, curr) => acc + curr.balance, 0);

    const netWorth = totalAssets + totalDebt;

    const monthlyIncome = flattenedTransactions?.filter(t => t.type === 'income' && t.date >= startOfMonth)
                                     .reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    const monthlyExpenses = flattenedTransactions?.filter(t => t.type === 'expense' && t.date >= startOfMonth && t.category_name?.toLowerCase() !== 'transferencia')
                                       .reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    // --- Stats for Charts ---
    
    // 1. Expenses by Category (EXCLUIR transferencias entre cuentas)
    
    
    const categoryMap = flattenedTransactions
      .filter(t => t.type === 'expense' && t.date >= startOfMonth && t.category_name?.toLowerCase() !== 'transferencia')
      .reduce((acc: any, curr: any) => {
        const name = curr.category_name;
        acc[name] = (acc[name] || 0) + Number(curr.amount);
        return acc;
      }, {});

    const chartColors = ['#00A3E0', '#316ee9', '#002D72', '#81cfff', '#039855', '#D92D20', '#FDB022'];
    const expensesByCategory = Object.keys(categoryMap).map((name, index) => ({
      name,
      value: categoryMap[name],
      color: chartColors[index % chartColors.length]
    })).sort((a, b) => b.value - a.value);

    // 2. Daily spending (last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }).reverse();

    const dailySpending = last7Days.map(dayStr => {
      const amount = flattenedTransactions
        .filter(t => t.type === 'expense' && t.date === dayStr && t.category_name?.toLowerCase() !== 'transferencia')
        .reduce((acc, curr) => acc + Number(curr.amount), 0);
      
      const label = new Date(dayStr + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'short' });
      return { name: label.charAt(0).toUpperCase() + label.slice(1), spend: amount };
    });

    const monthlySavings = monthlyIncome - monthlyExpenses;

    const creditLimit = accounts
      .filter(a => a.type === 'credit')
      .reduce((s, a) => s + Number(a.credit_limit || 0), 0);

    return {
      totalBalance: netWorth,
      totalAssets,
      totalDebt,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      creditLimit,
      recentTransactions: flattenedTransactions.slice(0, 5),
      expensesByCategory,
      dailySpending,
      accountBalances
    };
  },

  async createTransfer(transferData: {
    user_id: string;
    from_account_id: string;
    to_account_id: string;
    amount: number;
    date: string;
    description?: string;
  }): Promise<void> {
    const { from_account_id, to_account_id, amount, date, description, user_id } = transferData;

    // 1. Buscar o crear la categoría de Transferencia
    const { data: existingCats } = await supabase
      .from('categories')
      .select('id')
      .eq('name', 'Transferencia')
      .limit(1);

    let transferCatId: string;

    if (existingCats && existingCats.length > 0) {
      transferCatId = existingCats[0].id;
    } else {
      // Crear categoría por defecto si no existe
      const { data: newCat, error: catErr } = await supabase
        .from('categories')
        .insert([{
          name: 'Transferencia',
          type: 'expense',
          icon: 'transfer',
          color: '#6366F1',
          user_id // Inyectamos el ID del usuario para cumplir con RLS
        }])
        .select()
        .single();
      
      if (catErr) throw catErr;
      transferCatId = (newCat as any).id;
    }

    // 2. Insertar ambas transacciones atómicamente
    const { error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id,
          account_id: from_account_id,
          category_id: transferCatId,
          amount,
          type: 'transfer',
          date,
          description: description ? `[Transferencia] ${description} (Enviada)` : 'Transferencia enviada'
        },
        {
          user_id,
          account_id: to_account_id,
          category_id: transferCatId,
          amount,
          type: 'transfer',
          date,
          description: description ? `[Transferencia] ${description} (Recibida)` : 'Transferencia recibida'
        }
      ]);

    if (error) throw error;
  },

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .update(data)
      .eq('id', id);
    if (error) throw error;
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // --- Recurring Transactions ---
  
  // Helper: add months handling edge case (31st of month)
  addMonths(date: Date, months: number): Date {
    const year = date.getFullYear();
    const month = date.getMonth() + months;
    const day = date.getDate();
    
    const targetMonth = month % 12;
    const yearIncrement = Math.floor(month / 12);
    
    // Get the last day of the target month
    const getLastDayOfMonth = (y: number, m: number) => {
      return new Date(y, m + 1, 0).getDate();
    };
    
    const targetYear = year + yearIncrement;
    const targetLastDay = getLastDayOfMonth(targetYear, targetMonth);
    
    // If original day exceeds target month's days, use last day
    const finalDay = Math.min(day, targetLastDay);
    
    return new Date(targetYear, targetMonth, finalDay);
  },

  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  async getRecurringTransactions(): Promise<RecurringTransaction[]> {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select(`
        *,
        categories (name, icon, color),
        accounts (name)
      `)
      .order('next_execution_date', { ascending: true });
    
    if (error) throw error;
    return data as RecurringTransaction[];
  },

  async createRecurringTransaction(data: Omit<RecurringTransaction, 'id' | 'created_at' | 'updated_at'>): Promise<RecurringTransaction> {
    const { data: created, error } = await supabase
      .from('recurring_transactions')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return created as RecurringTransaction;
  },

  async updateRecurringTransaction(id: string, data: Partial<RecurringTransaction>): Promise<void> {
    const { error } = await supabase
      .from('recurring_transactions')
      .update(data)
      .eq('id', id);
    if (error) throw error;
  },

  async deleteRecurringTransaction(id: string): Promise<void> {
    // Soft delete - set is_active to false
    const { error } = await supabase
      .from('recurring_transactions')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw error;
  },

  async executeRecurringTransactions(): Promise<{ executed: number; errors: string[] }> {
    const { data: recurrences, error: fetchError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('is_active', true)
      .lte('next_execution_date', new Date().toISOString().split('T')[0]);
    
    if (fetchError) throw fetchError;
    
    let executedCount = 0;
    const errors: string[] = [];
    
    for (const recurrence of (recurrences || [])) {
      try {
        // Create the transaction
        await supabase.from('transactions').insert({
          user_id: recurrence.user_id,
          account_id: recurrence.account_id,
          category_id: recurrence.category_id,
          amount: recurrence.amount,
          type: recurrence.type,
          date: new Date().toISOString().split('T')[0],
          description: recurrence.description || `Recurrente automático`
        });
        
        // Calculate next execution date
        let nextDate: Date;
        const currentDate = new Date(recurrence.next_execution_date);
        
        switch (recurrence.frequency) {
          case 'monthly':
            nextDate = this.addMonths(currentDate, 1);
            break;
          case 'weekly':
            nextDate = this.addDays(currentDate, 7);
            break;
          case 'yearly':
            nextDate = this.addMonths(currentDate, 12);
            break;
          default:
            nextDate = this.addMonths(currentDate, 1);
        }
        
        // Update next_execution_date
        await supabase
          .from('recurring_transactions')
          .update({ next_execution_date: nextDate.toISOString().split('T')[0] })
          .eq('id', recurrence.id);
        
        executedCount++;
      } catch (err: any) {
        errors.push(`Error executing ${recurrence.id}: ${err.message}`);
        console.error('Error executing recurring transaction:', err);
      }
    }
    
    return { executed: executedCount, errors };
  }
};
