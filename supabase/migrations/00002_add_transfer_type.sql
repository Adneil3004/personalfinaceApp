-- Migración para añadir el tipo 'transfer' a las transacciones
-- Autor: Antigravity

-- 1. Eliminar la restricción existente
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_type_check;

-- 2. Volver a crear la restricción incluyendo 'transfer' (y mantenemos income/expense)
ALTER TABLE transactions 
ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('income', 'expense', 'transfer'));

-- 3. Limpiar registros: Todo lo que sea 'transferencia' pasa a ser 'transfer'
UPDATE transactions 
SET type = 'transfer' 
WHERE type = 'transferencia' OR category_id IN (SELECT id FROM categories WHERE name ILIKE 'Transferencia');
