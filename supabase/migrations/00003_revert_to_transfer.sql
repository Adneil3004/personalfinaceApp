-- Migración para volver al tipo 'transfer'
-- Autor: Antigravity

-- 1. Borrar la restricción actual para poder trabajar
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;

-- 2. Limpiar los datos: Convertir 'transferencia' a 'transfer'
UPDATE transactions SET type = 'transfer' WHERE type = 'transferencia';

-- 3. Volver a poner la restricción pero con el nuevo valor 'transfer'
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check CHECK (type IN ('income', 'expense', 'transfer'));
