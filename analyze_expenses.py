import json
import re

output_path = "/Users/adneil/.gemini/antigravity/brain/70e58ed6-b059-4d14-b33c-043a4ed42edd/.system_generated/steps/1776/output.txt"

with open(output_path, "r", encoding="utf-8") as f:
    file_data = json.load(f)

result_text = file_data["result"]

match = re.search(r"<untrusted-data-[^>]+>\s*(\[.*?\])\s*</untrusted-data-", result_text, re.DOTALL)
if not match:
    match = re.search(r"(\[.*\])", result_text, re.DOTALL)

json_str = match.group(1)
transactions = json.loads(json_str)

expense_txs = [t for t in transactions if t['type'] == 'expense']

excluded = []
included_with_car = []
included_no_car = []

for t in expense_txs:
    desc = t['description'].lower()
    amount = float(t['amount'])
    date = t['date']
    category_id = t['category_id']
    
    is_tv = "tv" in desc or "samsung" in desc or "eco renueva" in desc
    is_investment = "inversion" in desc or "gbm" in desc or category_id == "ad57ba22-b8b5-430c-a0a1-4f67097a4226"
    
    # We exclude wedding: boda, civil, rings (anillos), and Katia's dress (vestido katia)
    is_wedding = ("boda" in desc or "civil" in desc or "anillos" in desc or "vestido katia" in desc)
    
    is_car = (category_id == "077b2cf7-6995-43bf-a562-a5c2c8e7e742" or 
              "gasolina" in desc or 
              "caseta" in desc or 
              "rio" in desc or 
              "lavado" in desc or 
              "auto" in desc or
              "verificación" in desc)
    
    reason = []
    if is_tv: reason.append("TV")
    if is_investment: reason.append("Investment")
    if is_wedding: reason.append("Wedding")
    
    if reason:
        excluded.append((t, ", ".join(reason)))
    else:
        included_with_car.append(t)
        if not is_car:
            included_no_car.append(t)
        else:
            excluded.append((t, "Car"))

dates = [t['date'] for t in transactions]
min_date = min(dates)
max_date = max(dates)

from datetime import datetime
d1 = datetime.strptime(min_date, "%Y-%m-%d")
d2 = datetime.strptime(max_date, "%Y-%m-%d")
days = (d2 - d1).days + 1

# 1. Calculation: Excluded TV, Investments, Wedding, AND CAR
total_no_car = sum(float(t['amount']) for t in included_no_car)
avg_no_car = total_no_car / days

# 2. Calculation: Excluded TV, Investments, Wedding (CAR INCLUDED)
total_with_car = sum(float(t['amount']) for t in included_with_car)
avg_with_car = total_with_car / days

print("\n=== ANÁLISIS DE GASTOS EXCLUIDOS (CORREGIDO) ===")
print("Gastos de Boda Civil (incluyendo Anillos y Vestido):")
wedding_expenses = [t for t, r in excluded if "Wedding" in r]
for t in wedding_expenses:
    print(f"  - {t['date']} | ${float(t['amount']):.2f} | {t['description']}")
print(f"Total Boda Civil: ${sum(float(t['amount']) for t in wedding_expenses):.2f}")

print("\n=== RESUMEN DE GASTOS DIARIOS DEPURADO ===")
print(f"RANGO TEMPORAL: {days} días (del {min_date} al {max_date})")
print("-" * 50)
print(f"OPCIÓN A: Sin TV, Sin Inversiones, Sin Boda Civil (CON GASTOS DE AUTO):")
print(f"  * Gasto Total: ${total_with_car:.2f}")
print(f"  * PROMEDIO DIARIO: ${avg_with_car:.2f} pesos/día")
print(f"  * PROMEDIO MENSUAL equivalente: ${avg_with_car * 30.4:.2f} pesos/mes")
print("-" * 50)
print(f"OPCIÓN B: Sin TV, Sin Inversiones, Sin Boda Civil y SIN AUTO:")
print(f"  * Gasto Total: ${total_no_car:.2f}")
print(f"  * PROMEDIO DIARIO: ${avg_no_car:.2f} pesos/día")
print(f"  * PROMEDIO MENSUAL equivalente: ${avg_no_car * 30.4:.2f} pesos/mes")
print("-" * 50)
