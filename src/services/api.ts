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
  type: 'income' | 'expense';
  date: string;
  description?: string;
  
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
      .select('account_id, amount, type');
    if (tErr) throw tErr;

    return (accounts as Account[]).map(acc => {
      const transSum = (transactions || [])
        .filter(t => t.account_id === acc.id)
        .reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);
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
      .select('account_id, amount, type, date');
    if (tErr) throw tErr;

    const txns = transactions || [];
    const accs = accounts || [];

    let totalAssets = 0; // checking + cash
    let totalDebt = 0;   // credit

    accs.forEach(acc => {
      const delta = txns
        .filter(t => t.account_id === acc.id)
        .reduce((s, t) => s + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);
      
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
      const transSum = flattenedTransactions
        .filter(t => t.account_id === acc.id)
        .reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);
      
      return {
        name: acc.name,
        balance: Number(acc.initial_balance) + transSum,
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

    const monthlyExpenses = flattenedTransactions?.filter(t => t.type === 'expense' && t.date >= startOfMonth)
                                       .reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    // --- Stats for Charts ---
    
    // 1. Expenses by Category
    const categoryMap = flattenedTransactions
      .filter(t => t.type === 'expense' && t.date >= startOfMonth)
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
      return d.toISOString().split('T')[0];
    }).reverse();

    const dailySpending = last7Days.map(dayStr => {
      const amount = flattenedTransactions
        .filter(t => t.type === 'expense' && t.date === dayStr)
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
          type: 'expense',
          date,
          description: description ? `[Transferencia] ${description}` : 'Transferencia enviada'
        },
        {
          user_id,
          account_id: to_account_id,
          category_id: transferCatId,
          amount,
          type: 'income',
          date,
          description: description ? `[Transferencia] ${description}` : 'Transferencia recibida'
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
  }
};
