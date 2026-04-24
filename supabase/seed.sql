-- Seed data for local Supabase development
-- Updated with Jose's specific user and categories

-- 1. Create Jose's user for local development
-- Using a fixed UUID so references work reliably
insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) values (
    '00000000-0000-0000-0000-000000000000',
    'b05e8000-0000-0000-0000-000000000000', -- Jose's fixed UUID
    'authenticated',
    'authenticated',
    'josehdez800@yahoo.com',
    crypt('Upi2586398', gen_salt('bf')),
    current_timestamp,
    '{"provider":"email","providers":["email"]}',
    '{}',
    current_timestamp,
    current_timestamp
) on conflict (id) do nothing;

-- 2. Insert Parent Categories (Root)
insert into public.categories (id, user_id, name, type, icon, color) values
('c1000000-0000-0000-0000-000000000000', 'b05e8000-0000-0000-0000-000000000000', 'Vivienda y Servicios (Fijos)', 'expense', 'home', '#002D72'),
('c2000000-0000-0000-0000-000000000000', 'b05e8000-0000-0000-0000-000000000000', 'Alimentación y Consumo', 'expense', 'shopping-cart', '#0056D2'),
('c3000000-0000-0000-0000-000000000000', 'b05e8000-0000-0000-0000-000000000000', 'Bienestar y Salud', 'expense', 'heart', '#00A3E0'),
('c4000000-0000-0000-0000-000000000000', 'b05e8000-0000-0000-0000-000000000000', 'Estilo de Vida (Variables)', 'expense', 'coffee', '#002D72'),
('c5000000-0000-0000-0000-000000000000', 'b05e8000-0000-0000-0000-000000000000', 'Finanzas', 'expense', 'dollar-sign', '#0056D2'),
('c6000000-0000-0000-0000-000000000000', 'b05e8000-0000-0000-0000-000000000000', 'Otros', 'expense', 'more-horizontal', '#00A3E0'),
('c7000000-0000-0000-0000-000000000000', 'b05e8000-0000-0000-0000-000000000000', 'Ingresos', 'income', 'trending-up', '#039855')
on conflict (id) do update set user_id = excluded.user_id, name = excluded.name;

-- 3. Insert Subcategories
insert into public.categories (user_id, parent_id, name, type, icon, color) values
-- Vivienda y Servicios
('b05e8000-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000000', 'Renta / Hipoteca', 'expense', 'key', '#002D72'),
('b05e8000-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000000', 'Electricidad (Especial para monitorear el Inverter)', 'expense', 'zap', '#F59E0B'),
('b05e8000-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000000', 'Agua y Gas', 'expense', 'droplet', '#00A3E0'),
('b05e8000-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000000', 'Internet', 'expense', 'wifi', '#0056D2'),
('b05e8000-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000000', 'Mantenimiento Hogar (Reparaciones, limpieza)', 'expense', 'tool', '#002D72'),

-- Alimentación y Consumo
('b05e8000-0000-0000-0000-000000000000', 'c2000000-0000-0000-0000-000000000000', 'Supermercado (Despensa y básicos)', 'expense', 'shopping-bag', '#0056D2'),
('b05e8000-0000-0000-0000-000000000000', 'c2000000-0000-0000-0000-000000000000', 'Restaurantes y Café (Salidas y antojos)', 'expense', 'utensils', '#0056D2'),
('b05e8000-0000-0000-0000-000000000000', 'c2000000-0000-0000-0000-000000000000', 'Delivery (Apps de comida)', 'expense', 'truck', '#0056D2'),

-- Bienestar y Salud
('b05e8000-0000-0000-0000-000000000000', 'c3000000-0000-0000-0000-000000000000', 'Salud (Médicos, farmacia, seguro)', 'expense', 'stethoscope', '#00A3E0'),
('b05e8000-0000-0000-0000-000000000000', 'c3000000-0000-0000-0000-000000000000', 'Cuidado Personal (Barbería, aseo, gimnasio)', 'expense', 'smile', '#00A3E0'),

-- Estilo de Vida (Variables)
('b05e8000-0000-0000-0000-000000000000', 'c4000000-0000-0000-0000-000000000000', 'Suscripciones (Netflix, Spotify, etc.)', 'expense', 'play-circle', '#002D72'),
('b05e8000-0000-0000-0000-000000000000', 'c4000000-0000-0000-0000-000000000000', 'Ocio y Entretenimiento (Cine, eventos, juegos)', 'expense', 'ticket', '#002D72'),
('b05e8000-0000-0000-0000-000000000000', 'c4000000-0000-0000-0000-000000000000', 'Ropa y Calzado', 'expense', 'shirt', '#002D72'),
('b05e8000-0000-0000-0000-000000000000', 'c4000000-0000-0000-0000-000000000000', 'Regalos y Social', 'expense', 'gift', '#002D72'),

-- Finanzas
('b05e8000-0000-0000-0000-000000000000', 'c5000000-0000-0000-0000-000000000000', 'Ahorro / Inversión', 'expense', 'trending-up', '#0056D2'),
('b05e8000-0000-0000-0000-000000000000', 'c5000000-0000-0000-0000-000000000000', 'Préstamos / Deudas', 'expense', 'credit-card', '#0056D2'),
('b05e8000-0000-0000-0000-000000000000', 'c5000000-0000-0000-0000-000000000000', 'Seguros (Auto o Vida)', 'expense', 'shield', '#0056D2'),
('b05e8000-0000-0000-0000-000000000000', 'c5000000-0000-0000-0000-000000000000', 'Comisiones Bancarias', 'expense', 'percent', '#0056D2'),

-- Otros
('b05e8000-0000-0000-0000-000000000000', 'c6000000-0000-0000-0000-000000000000', 'Transporte (Gasolina, Uber, mantenimientos)', 'expense', 'car', '#00A3E0'),
('b05e8000-0000-0000-0000-000000000000', 'c6000000-0000-0000-0000-000000000000', 'Gastos Varios (Imprevistos menores)', 'expense', 'help-circle', '#00A3E0'),

-- Ingresos
('b05e8000-0000-0000-0000-000000000000', 'c7000000-0000-0000-0000-000000000000', 'Salario', 'income', 'briefcase', '#039855'),
('b05e8000-0000-0000-0000-000000000000', 'c7000000-0000-0000-0000-000000000000', 'Honorarios', 'income', 'file-text', '#039855'),
('b05e8000-0000-0000-0000-000000000000', 'c7000000-0000-0000-0000-000000000000', 'Ventas', 'income', 'tag', '#039855'),
('b05e8000-0000-0000-0000-000000000000', 'c7000000-0000-0000-0000-000000000000', 'Otros Ingresos', 'income', 'plus-circle', '#039855')
on conflict (user_id, name, parent_id) do update set name = excluded.name;

-- 4. Insert Jose's Accounts
insert into public.accounts (id, user_id, name, type, initial_balance, currency, color, icon) values
('70000000-0000-0000-0000-000000000000', 'b05e8000-0000-0000-0000-000000000000', 'Banco Popular', 'checking', 50000.00, 'DOP', '#0056D2', 'landmark'),
('80000000-0000-0000-0000-000000000000', 'b05e8000-0000-0000-0000-000000000000', 'Efectivo', 'cash', 2000.00, 'DOP', '#00A3E0', 'banknote')
on conflict (id) do update set user_id = excluded.user_id;

