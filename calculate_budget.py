# Presupuesto Diario Adneil - Solo su Ingreso Base Seguro
# Ingreso Base Adneil: $21,800 MXN al mes (2 catorcenas de $10,900)

ingreso_mensual_base = 21800.00

# Gastos Fijos
mantenimiento_aldares = 500.00
internet_telmex = 349.00
plan_telcel = 579.00
agua_gas_promedio = 600.00
tv_samsung_msi = 1054.71
medicamentos_recurrentes = 480.00

total_fijos = (mantenimiento_aldares + internet_telmex + plan_telcel + 
               agua_gas_promedio + tv_samsung_msi + medicamentos_recurrentes)

# Gastos Variables Necesarios
supermercado_estimado = 3500.00
gasolina_casetas_estimado = 4500.00

total_necesarios = supermercado_estimado + gasolina_casetas_estimado

# Meta de Ahorro Saludable (20% del ingreso base de Adneil)
ahorro_meta = ingreso_mensual_base * 0.20

# Dinero Libre Mensual (Para gustos, salidas, ropa)
dinero_libre_mensual = ingreso_mensual_base - total_fijos - total_necesarios - ahorro_meta
dinero_libre_diario = dinero_libre_mensual / 30.4

print(f"=== ESTRUCTURA MENSUAL SOLO ADNEIL ===")
print(f"Ingreso Seguro: ${ingreso_mensual_base:.2f}")
print(f"Gastos Fijos (con la Tele): ${total_fijos:.2f}")
print(f"Gastos Variables Necesarios: ${total_necesarios:.2f}")
print(f"Ahorro Base (20%): ${ahorro_meta:.2f}")
print(f"Dinero Libre para Gustos (Mensual): ${dinero_libre_mensual:.2f}")
print(f"Límite diario para Gustos/Salidas: ${dinero_libre_diario:.2f} pesos/día")

# Límite diario operativo total
presupuesto_diario_total = (total_necesarios + dinero_libre_mensual) / 30.4
print(f"\nLímite Diario Operativo (Súper, Gasolina y Gustos): ${presupuesto_diario_total:.2f} pesos/día")
