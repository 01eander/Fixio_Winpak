# 🚀 Guía para Continuar el Proyecto en Otra Computadora

## 📋 Pre-requisitos
- ✅ Docker Desktop instalado y corriendo
- ✅ Git instalado
- ✅ Node.js instalado (v18 o superior recomendado)
- ✅ Editor de código (VS Code recomendado)

---

## 🔄 Pasos para Configurar el Proyecto

### 1️⃣ Clonar el Repositorio

```bash
# Navega a la carpeta donde quieres el proyecto
cd C:\Users\TuUsuario\Documents\Proyectos

# Clona el repositorio
git clone https://github.com/TuUsuario/Fixio_Winpak.git

# Entra a la carpeta del proyecto
cd Fixio_Winpak

# Cambia a la rama de desarrollo
git checkout feature/database-integration
```

---

### 2️⃣ Instalar Dependencias

```bash
# Instalar dependencias del frontend (React + Vite)
npm install

# Instalar dependencias del backend (Express)
cd server
npm install
cd ..
```

---

### 3️⃣ Configurar Variables de Entorno

El archivo `.env` ya existe en el repositorio con la configuración correcta:

```env
VITE_API_URL=http://localhost:3000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=oFixio_db
DB_PASSWORD=postgres
DB_PORT=5432
PORT=3000
```

**No necesitas modificar nada**, pero verifica que el archivo `.env` esté presente en la raíz del proyecto.

---

### 4️⃣ Levantar la Base de Datos con Docker

```bash
# Asegúrate de estar en la raíz del proyecto
# Levanta PostgreSQL y pgAdmin con Docker Compose
docker-compose up -d

# Verifica que los contenedores estén corriendo
docker ps
```

Deberías ver dos contenedores:
- `fixio_db` (PostgreSQL en puerto 5432)
- `fixio_pgadmin` (pgAdmin en puerto 5050)

---

### 5️⃣ Ejecutar las Migraciones de Base de Datos

```bash
# Ejecuta la migración principal
Get-Content migration.sql | docker exec -i fixio_db psql -U postgres -d oFixio_db

# Ejecuta las migraciones adicionales en orden
Get-Content migration_inventory_warehouses.sql | docker exec -i fixio_db psql -U postgres -d oFixio_db
Get-Content migration_jobs.sql | docker exec -i fixio_db psql -U postgres -d oFixio_db
Get-Content migration_job_tools.sql | docker exec -i fixio_db psql -U postgres -d oFixio_db
Get-Content migration_user_tools.sql | docker exec -i fixio_db psql -U postgres -d oFixio_db
Get-Content migration_work_order_tasks.sql | docker exec -i fixio_db psql -U postgres -d oFixio_db
Get-Content migration_warehouse_personal.sql | docker exec -i fixio_db psql -U postgres -d oFixio_db
```

**Nota para Linux/Mac:** Usa `cat` en lugar de `Get-Content`:
```bash
cat migration.sql | docker exec -i fixio_db psql -U postgres -d oFixio_db
```

---

### 6️⃣ Iniciar el Proyecto

Necesitas **3 terminales** abiertas:

#### Terminal 1 - Frontend (Vite + React)
```bash
npm run dev
```
El frontend estará disponible en: **http://localhost:5173**

#### Terminal 2 - Backend (Express API)
```bash
cd server
npm run dev
```
El backend estará disponible en: **http://localhost:3000**

#### Terminal 3 - Docker (ya está corriendo)
```bash
# Solo para verificar logs si es necesario
docker-compose logs -f
```

---

### 7️⃣ Acceder a pgAdmin (Opcional)

Si necesitas administrar la base de datos visualmente:

1. Abre tu navegador en: **http://localhost:5050**
2. Login:
   - Email: `admin@admin.com`
   - Password: `admin`
3. Agregar servidor:
   - Host: `fixio_db`
   - Port: `5432`
   - Database: `oFixio_db`
   - Username: `postgres`
   - Password: `postgres`

---

## 🔄 Comandos Útiles para el Día a Día

### Actualizar el Código desde GitHub
```bash
# Asegúrate de estar en la rama correcta
git checkout feature/database-integration

# Descarga los últimos cambios
git pull origin feature/database-integration
```

### Detener el Proyecto
```bash
# Detener frontend y backend: Ctrl+C en cada terminal

# Detener Docker
docker-compose down
```

### Reiniciar Docker (si hay problemas)
```bash
# Detener y eliminar contenedores
docker-compose down

# Limpiar volúmenes (CUIDADO: esto borra los datos de la BD)
docker-compose down -v

# Volver a levantar
docker-compose up -d

# Re-ejecutar migraciones
Get-Content migration.sql | docker exec -i fixio_db psql -U postgres -d oFixio_db
# ... (ejecutar todas las migraciones de nuevo)
```

### Ver Logs de Docker
```bash
# Ver logs de PostgreSQL
docker logs fixio_db

# Ver logs en tiempo real
docker-compose logs -f
```

---

## 📁 Estructura del Proyecto

```
Fixio_Winpak/
├── src/                    # Frontend React
│   ├── pages/             # Páginas de la aplicación
│   ├── components/        # Componentes reutilizables
│   └── main.jsx          # Punto de entrada
├── server/                # Backend Express
│   └── index.js          # API REST
├── data_templates/        # Plantillas CSV para el cliente
├── migration*.sql         # Scripts de migración de BD
├── docker-compose.yml     # Configuración de Docker
├── .env                   # Variables de entorno
└── package.json          # Dependencias del proyecto
```

---

## ⚠️ Solución de Problemas Comunes

### Error: "Puerto 5432 ya está en uso"
```bash
# Detener PostgreSQL local si lo tienes instalado
# O cambiar el puerto en docker-compose.yml
```

### Error: "Cannot connect to database"
```bash
# Verificar que Docker esté corriendo
docker ps

# Reiniciar contenedores
docker-compose restart
```

### Error: "Module not found"
```bash
# Reinstalar dependencias
npm install
cd server && npm install
```

### Error: "EADDRINUSE: address already in use"
```bash
# El puerto 3000 o 5173 está ocupado
# Cierra otras aplicaciones o cambia el puerto en .env
```

---

## 🎯 Checklist de Verificación

Antes de empezar a trabajar, verifica que:

- [ ] Docker Desktop está corriendo
- [ ] Los contenedores `fixio_db` y `fixio_pgadmin` están activos (`docker ps`)
- [ ] Las migraciones se ejecutaron sin errores
- [ ] El frontend corre en http://localhost:5173
- [ ] El backend corre en http://localhost:3000
- [ ] Puedes hacer login en la aplicación

---

## 📞 Contacto

Si tienes problemas, revisa:
1. Los logs de Docker: `docker-compose logs`
2. Los logs del backend: Terminal donde corre `npm run dev` en `/server`
3. La consola del navegador (F12) para errores del frontend

---

**¡Listo para continuar trabajando! 🚀**
