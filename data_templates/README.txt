# 📋 PLANTILLAS DE CARGA MASIVA DE DATOS - FIXIO WINPAK

## 📌 INSTRUCCIONES GENERALES

Este conjunto de archivos CSV está diseñado para que pueda cargar datos reales de su empresa de manera masiva en el sistema.

### ⚠️ IMPORTANTE - ORDEN DE CARGA

**Los archivos DEBEN cargarse en el orden numérico indicado** (1, 2, 3, etc.) ya que algunos dependen de datos de archivos anteriores.

---

## 📁 ARCHIVOS Y DESCRIPCIÓN

### 1️⃣ **1_departamentos.csv**
**Departamentos de la empresa**
- **Columna:** `name` (Nombre del departamento)
- **Ejemplos:** Mantenimiento, Producción, Logística, Calidad
- **Notas:** Agregue todos los departamentos de su organización

---

### 2️⃣ **2_roles.csv**
**Roles de usuario en el sistema**
- **Columna:** `name` (Nombre del rol)
- **Ejemplos:** Administrador, Técnico de Mantenimiento, Operador
- **Notas:** Defina los roles que tendrán sus usuarios

---

### 3️⃣ **3_areas.csv**
**Áreas físicas de la planta**
- **Columna:** `name` (Nombre del área)
- **Ejemplos:** Área de Producción, Área de Empaque, Área de Almacén
- **Notas:** Estas áreas se usarán para ubicar equipos y almacenes

---

### 4️⃣ **4_almacenes.csv**
**Almacenes de la empresa**
- **Columnas:**
  - `name`: Nombre del almacén
  - `area_name`: Nombre del área donde está ubicado (debe existir en 3_areas.csv)
  - `is_personal`: TRUE para almacenes personales de mecánicos, FALSE para almacenes generales
- **Ejemplos:**
  - Almacén General,Área de Almacén,FALSE
  - Almacén Personal - Juan Pérez,Área de Mantenimiento,TRUE
- **Notas:** 
  - Los almacenes personales (TRUE) solo pueden asignarse a usuarios de Mantenimiento
  - Los almacenes generales (FALSE) se usan para surtir órdenes de trabajo

---

### 5️⃣ **5_categorias_activos.csv**
**Categorías de activos/equipos**
- **Columna:** `name` (Nombre de la categoría)
- **Valores recomendados:** Maquinaria, Vehículo, Herramienta, Área
- **Notas:** NO modifique "Área" y "Herramienta" ya que el sistema los usa internamente

---

### 6️⃣ **6_equipos.csv**
**Equipos, maquinaria y herramientas**
- **Columnas:**
  - `name`: Nombre del equipo
  - `model`: Modelo del equipo
  - `serial_number`: Número de serie
  - `category_name`: Categoría (debe existir en 5_categorias_activos.csv)
  - `area_name`: Área donde está ubicado (debe existir en 3_areas.csv)
  - `status`: Estado del equipo (OPERATIVO, MANTENIMIENTO, FUERA_DE_SERVICIO, SCRAPPED)
  - `acquisition_date`: Fecha de adquisición (formato: YYYY-MM-DD)
- **Notas:** Las herramientas que se usarán en tareas de mantenimiento deben tener category_name = "Herramienta"

---

### 7️⃣ **7_categorias_inventario.csv**
**Categorías de items de inventario**
- **Columna:** `name` (Nombre de la categoría)
- **Valores recomendados:** Refacción, Consumible, Herramienta
- **Notas:** Puede agregar más categorías según sus necesidades

---

### 8️⃣ **8_items_inventario.csv**
**Items de inventario (refacciones, consumibles, etc.)**
- **Columnas:**
  - `name`: Nombre del item
  - `description`: Descripción detallada
  - `sku`: Código SKU único
  - `category_name`: Categoría (debe existir en 7_categorias_inventario.csv)
  - `unit_of_measure`: Unidad de medida (Pieza, Litro, Kilo, Metro, etc.)
  - `min_stock`: Stock mínimo para alertas
  - `max_stock`: Stock máximo recomendado
- **Notas:** El sistema alertará cuando el stock baje del mínimo

---

### 9️⃣ **9_usuarios.csv**
**Usuarios del sistema**
- **Columnas:**
  - `full_name`: Nombre completo
  - `email`: Correo electrónico (debe ser único)
  - `role_name`: Rol del usuario (debe existir en 2_roles.csv)
  - `department_name`: Departamento (debe existir en 1_departamentos.csv)
  - `default_warehouse_name`: Almacén predeterminado (SOLO para usuarios de Mantenimiento, debe ser un almacén personal de 4_almacenes.csv)
  - `password`: Contraseña temporal (el usuario debe cambiarla al primer login)
- **Notas:** 
  - Deje `default_warehouse_name` vacío para usuarios que no sean de Mantenimiento
  - Solo almacenes personales pueden asignarse a usuarios de Mantenimiento

---

### 🔟 **10_tareas_mantenimiento.csv**
**Tareas de mantenimiento preventivo**
- **Columnas:**
  - `name`: Nombre de la tarea
  - `description`: Descripción detallada del procedimiento
  - `frequency_days`: Frecuencia en días (30 = mensual, 90 = trimestral, 365 = anual)
  - `estimated_duration_hours`: Duración estimada en horas
- **Notas:** Estas tareas se usarán para crear órdenes de trabajo programadas

---

### 1️⃣1️⃣ **11_turnos.csv**
**Turnos de trabajo**
- **Columnas:**
  - `name`: Nombre del turno
  - `description`: Descripción u horario
  - `daily_hours`: Horas laborables por día (ej: 8.0, 7.5)
- **Notas:** Estos turnos se asignan a los usuarios para el control de asistencia y planeación.

---

## 🔧 FORMATO DE ARCHIVOS

- **Codificación:** UTF-8
- **Separador:** Coma (,)
- **Encabezados:** Primera fila debe contener los nombres de columnas
- **Fechas:** Formato YYYY-MM-DD (ejemplo: 2024-01-15)
- **Valores booleanos:** TRUE o FALSE (en mayúsculas)
- **Campos vacíos:** Dejar en blanco si no aplica (no usar NULL ni N/A)

---

## ✅ VALIDACIONES IMPORTANTES

1. **Nombres únicos:** Los nombres en catálogos (departamentos, roles, áreas, etc.) deben ser únicos
2. **Emails únicos:** Los correos en usuarios deben ser únicos
3. **SKUs únicos:** Los códigos SKU en inventario deben ser únicos
4. **Referencias válidas:** Cuando un campo hace referencia a otro archivo (ejemplo: area_name), el valor DEBE existir en el archivo correspondiente
5. **Almacenes personales:** Solo pueden asignarse a usuarios de departamento "Mantenimiento"

---

## 📞 SOPORTE

Si tiene dudas sobre cómo llenar algún campo o necesita agregar más columnas, contacte al equipo de desarrollo.

---

## 📝 EJEMPLO DE FLUJO COMPLETO

1. Llene **1_departamentos.csv** con: Mantenimiento, Producción, Logística
2. Llene **2_roles.csv** con: Administrador, Técnico, Operador
3. Llene **3_areas.csv** con: Área de Producción, Área de Almacén
4. Llene **4_almacenes.csv** con:
   - Almacén General,Área de Almacén,FALSE
   - Almacén Personal - Juan,Área de Almacén,TRUE
5. Llene **5_categorias_activos.csv** (mantener: Maquinaria, Vehículo, Herramienta, Área)
6. Llene **6_equipos.csv** con sus equipos reales
7. Llene **7_categorias_inventario.csv** (mantener: Refacción, Consumible, Herramienta)
8. Llene **8_items_inventario.csv** con sus refacciones y consumibles
9. Llene **9_usuarios.csv** asignando:
   - Usuarios de Mantenimiento → Almacenes personales
   - Otros usuarios → Sin almacén predeterminado
10. Llene **10_tareas_mantenimiento.csv** con sus rutinas de mantenimiento
11. Llene **11_turnos.csv** con los turnos de su planta

---

**¡Éxito con la carga de datos! 🚀**
