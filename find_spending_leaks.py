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

# Let's filter out Boda/TV/Investment
clean_expenses = []
wedding_sum = 0
for t in expense_txs:
    desc = t['description'].lower()
    amount = float(t['amount'])
    category_id = t['category_id']
    
    is_tv = "tv" in desc or "samsung" in desc or "eco renueva" in desc
    is_investment = "inversion" in desc or "gbm" in desc or category_id == "ad57ba22-b8b5-430c-a0a1-4f67097a4226"
    is_wedding = ("boda" in desc or "civil" in desc or "anillos" in desc or "vestido katia" in desc)
    
    if is_wedding:
        wedding_sum += amount
    
    if not (is_tv or is_investment or is_wedding):
        clean_expenses.append(t)

# Categorize and analyze clean_expenses
category_totals = {}
description_counts = {}

# Map category IDs to names (hardcoded from previous category list)
category_map = {
    "49aed97e-5c53-40f5-94da-39de8ba0ee84": "Equipo Fotografico",
    "e82b7c2b-3f3a-4eb6-9846-ea9bf3302380": "Telefonia Movil",
    "3a345ba9-e524-454d-be69-eb57124a4f1b": "Renta / Hipoteca",
    "f0bbdb79-2864-4b0e-b715-f9817325560d": "Agua y Gas",
    "5ab46b93-9464-4b13-8aec-9cd2663103fe": "Internet",
    "54b881c3-bff1-413d-9267-56d929b65827": "Mantenimiento Hogar",
    "73222620-702f-459a-8b0c-fc33d58d383d": "Supermercado",
    "1c04d427-e725-4701-989a-fb9b58710bdd": "Restaurantes y Café",
    "e930778c-314d-493b-9c63-5bb46475043a": "Delivery",
    "ec494e19-3c14-4b0c-99a2-5046807ee81f": "Salud",
    "34b03684-1b18-4cee-b814-2672e76340d2": "Cuidado Personal",
    "f8eb48b2-85a1-452e-be41-538db4eae816": "Suscripciones",
    "8e4aafb0-6fab-431d-b917-1dfabe1a1f5d": "Ocio y Entretenimiento",
    "7d978165-3ea0-4a74-bd65-f0e720762378": "Ropa y Calzado",
    "5b04c243-803e-4b54-9766-204312eb4ac9": "Regalos y Social",
    "ad57ba22-b8b5-430c-a0a1-4f67097a4226": "Ahorro / Inversión",
    "11388758-9bac-4551-9705-336941f28c0c": "Préstamos / Deudas",
    "d5362cc3-acf0-4430-9adf-23d3f68ee33a": "Seguros",
    "62174a7f-53d5-4030-9861-b123a91e4a6e": "Comisiones Bancarias",
    "077b2cf7-6995-43bf-a562-a5c2c8e7e742": "Transporte (Auto, Gasolina, Casetas)",
    "cd064b8d-4629-4747-993e-f7815fda622d": "Gastos Varios / Propinas"
}

total_spending = 0
for t in clean_expenses:
    amount = float(t['amount'])
    total_spending += amount
    cat_id = t['category_id']
    cat_name = category_map.get(cat_id, "Desconocido")
    
    category_totals[cat_name] = category_totals.get(cat_name, 0) + amount
    
    desc_clean = t['description'].strip().capitalize() if t['description'] else "(Sin descripción)"
    description_counts[desc_clean] = description_counts.get(desc_clean, 0) + 1

print(f"Total Clean Spending Analyzed: ${total_spending:.2f}")

# Sort categories by total
print("\n--- GASTO POR CATEGORÍA (ORDENADO DE MAYOR A MENOR) ---")
sorted_categories = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
for cat, val in sorted_categories:
    pct = (val / total_spending) * 100
    print(f"  * {cat}: ${val:.2f} ({pct:.1f}%)")

# Let's dive deep into discretionary variables: Restaurants and Varios
print("\n--- DETALLE EN RESTAURANTES Y CAFÉ ---")
rest_txs = [t for t in clean_expenses if category_map.get(t['category_id']) == "Restaurantes y Café"]
rest_sum = sum(float(t['amount']) for t in rest_txs)
print(f"Total Restaurantes: ${rest_sum:.2f} en {len(rest_txs)} visitas")
for t in sorted(rest_txs, key=lambda x: float(x['amount']), reverse=True):
    print(f"  - {t['date']} | ${float(t['amount']):.2f} | {t['description']}")

print("\n--- DETALLE EN HOGAR Y COMPRAS ---")
home_txs = [t for t in clean_expenses if category_map.get(t['category_id']) in ["Mantenimiento Hogar", "Ropa y Calzado", "Ocio y Entretenimiento", "Regalos y Social"]]
for t in sorted(home_txs, key=lambda x: float(x['amount']), reverse=True):
    print(f"  - {t['date']} | ${float(t['amount']):.2f} | {t['description']} | Categoría: {category_map.get(t['category_id'])}")

print("\n--- DETALLE EN SALUD (TEMPORAL) ---")
health_txs = [t for t in clean_expenses if category_map.get(t['category_id']) == "Salud"]
health_sum = sum(float(t['amount']) for t in health_txs)
print(f"Total Salud: ${health_sum:.2f}")
for t in sorted(health_txs, key=lambda x: float(x['amount']), reverse=True):
    print(f"  - {t['date']} | ${float(t['amount']):.2f} | {t['description']}")

print("\n--- DETALLE GASTOS VARIOS / ANTOJOS (HORA COLACIÓN/LEAKS) ---")
leaks_txs = [t for t in clean_expenses if category_map.get(t['category_id']) == "Gastos Varios / Propinas" or "botana" in t['description'].lower() or "coca" in t['description'].lower() or "paleta" in t['description'].lower()]
leaks_sum = sum(float(t['amount']) for t in leaks_txs)
print(f"Total Fugas Hormiga: ${leaks_sum:.2f} en {len(leaks_txs)} transacciones")
for t in sorted(leaks_txs, key=lambda x: float(x['amount']), reverse=True):
    print(f"  - {t['date']} | ${float(t['amount']):.2f} | {t['description']}")
