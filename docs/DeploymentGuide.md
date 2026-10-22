# 🚀 Guía de Deployment - SteelCraft v1.0

Guía completa para desplegar SteelCraft a producción usando Railway (backend) y Vercel (frontend).

---

## 📋 Requisitos Previos

- Cuenta en [Railway](https://railway.app/) (backend)
- Cuenta en [Vercel](https://vercel.com/) (frontend)
- Repositorio GitHub público o privado
- Dominio personalizado (opcional)

---

## 🔵 PARTE 1: Deploy Backend (Railway)

### 1.1 Preparar el Proyecto

```bash
# Asegurarse que el código está en GitHub
git add .
git commit -m "Ready for production v1.0"
git push origin main
```

### 1.2 Crear Proyecto en Railway

```bash
# Opción 1: Via CLI
npm install -g @railway/cli
railway login
railway init

# Opción 2: Via UI (recomendado)
# 1. Ir a railway.app
# 2. Click "New Project"
# 3. Seleccionar "Deploy from GitHub"
# 4. Conectar repositorio
# 5. Seleccionar rama (main)
```

### 1.3 Configurar Base de Datos PostgreSQL

```bash
# En Railway Dashboard:
# 1. Click "+ Add Service"
# 2. Seleccionar "PostgreSQL"
# 3. Esto crea automáticamente DATABASE_URL
```

### 1.4 Configurar Variables de Entorno

```bash
# En Railway Dashboard > Variables:
JWT_SECRET_KEY=tu-clave-super-segura-min-32-caracteres-aleatorios
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

ENVIRONMENT=production
DEBUG=False

# CORS para Vercel (actualizar con tu dominio)
ALLOWED_ORIGINS=https://steelcraft-frontend.vercel.app,https://tu-dominio.com

# API Info
API_TITLE=SteelCraft API v1.0
API_VERSION=1.0.0
```

### 1.5 Configurar Health Check

```bash
# En Railway > Settings > Health Check
# Path: /health
# Port: 8000
# Esto asegura que Railway reinicia si la API cae
```

### 1.6 Deploy

Railway auto-deploya cuando pushhes a main.

```bash
# Ver logs
railway logs

# Ver estado
railway status
```

### 1.7 Verificar Deploy

```bash
# Obtener URL de producción
railway env | grep RAILWAY_PUBLIC_DOMAIN

# Probar endpoints
curl https://tu-api-railway.app/docs
curl https://tu-api-railway.app/health

# Esperar ~2-3 minutos para que esté listo
```

---

## 🟡 PARTE 2: Deploy Frontend (Vercel)

### 2.1 Configurar Proyecto Local

```bash
cd frontend

# Asegurar que package.json tiene:
# "build": "tsc -b && vite build"
# "preview": "vite preview"

# Verificar build
npm run build

# Verificar que dist/ se generó
ls -la dist/
```

### 2.2 Conectar a Vercel

```bash
# Opción 1: Via CLI
npm i -g vercel
vercel login
vercel deploy

# Opción 2: Via UI (recomendado)
# 1. Ir a vercel.com
# 2. Click "Add New Project"
# 3. Importar repositorio GitHub
# 4. Seleccionar "SteelCraft" > folder "frontend"
```

### 2.3 Configurar Build Settings

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 2.4 Configurar Variables de Entorno

```bash
# En Vercel > Settings > Environment Variables:

# Production
VITE_API_URL=https://tu-api-railway.app/api
VITE_APP_NAME=SteelCraft
VITE_ENV=production

# Preview (staging)
VITE_API_URL=https://tu-api-staging.railway.app/api (si existe)

# Development (local)
VITE_API_URL=http://localhost:8000/api
```

### 2.5 Deploy

```bash
# Vercel auto-deploya cuando pushhes a main
# O triggerea manualmente en Vercel Dashboard

# Ver deployments
vercel list
```

### 2.6 Verificar Deploy

```bash
# Tu frontend estará en:
# https://steelcraft-frontend.vercel.app
# o tu-dominio-personalizado.com

# Probar login
# 1. Ir a https://steelcraft-frontend.vercel.app
# 2. Intentar login
# 3. Verificar que se conecta a la API
```

---

## 🌐 PARTE 3: Configurar Dominio Personalizado

### 3.1 Backend (Railway)

```bash
# En Railway > Settings > Domains
# 1. Click "+ Add Domain"
# 2. Ingresar tu-api.ejemplo.com
# 3. Copiar valores CNAME/TXT
# 4. Actualizar DNS en tu registrador
# 5. Esperar ~30 min para que propague

# Verificar
nslookup tu-api.ejemplo.com
curl https://tu-api.ejemplo.com/health
```

### 3.2 Frontend (Vercel)

```bash
# En Vercel > Settings > Domains
# 1. Click "Add Domain"
# 2. Ingresar ejemplo.com o app.ejemplo.com
# 3. Vercel configura automáticamente
# 4. Esperar ~30 min para SSL

# Verificar
curl https://app.ejemplo.com
```

---

## 🔧 PARTE 4: Post-Deployment

### 4.1 Migraciones de Base de Datos

```bash
# Primera vez que deployas, ejecutar migraciones:

# Opción 1: Via Railway CLI
railway run alembic upgrade head

# Opción 2: Manual en Railway Container
# 1. Railway Dashboard > FastAPI Service
# 2. Click "Shell"
# 3. Ejecutar: python -m alembic upgrade head
```

### 4.2 Seed de Datos (Músculos)

```bash
# Si es primera vez y necesitas músculos en BD:

# Opción 1: Via Railway Shell
railway run python app/importer/seed_muscles.py

# Opción 2: Via API (admin solo)
POST /api/admin/seed
```

### 4.3 Crear Usuario Admin

```bash
# Via Railway Shell
railway run python -c "
from app.db import SessionLocal
from app.models import User
from app.utils import hash_password

db = SessionLocal()
admin = User(
    email='admin@ejemplo.com',
    hashed_password=hash_password('admin_password_fuerte'),
    full_name='Admin',
    role='admin'
)
db.add(admin)
db.commit()
"
```

---

## 🔒 PARTE 5: Seguridad en Producción

### 5.1 Variables de Entorno Seguras

```bash
# ✅ DO - Usar variables en plataforma
# - Railway > Variables
# - Vercel > Secrets
# - Nunca en código, nunca en .env

# ❌ DON'T
# - Pushear .env a GitHub
# - Hardcodear secretos
# - Usar misma clave en dev/prod
```

### 5.2 JWT Secret en Producción

```bash
# Generar clave segura (32+ caracteres random)
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Usar ese valor en Railway > JWT_SECRET_KEY
# Nunca compartir, cambiar cada 3-6 meses
```

### 5.3 CORS en Producción

```bash
# En Railway > ALLOWED_ORIGINS:
ALLOWED_ORIGINS=https://steelcraft-frontend.vercel.app,https://tu-dominio.com

# NOT http:// (solo https en prod)
# NOT localhost:3000
# NOT *
```

### 5.4 HTTPS y Redirects

```bash
# Railway auto maneja HTTPS (con Railway domain o custom)
# Vercel auto maneja HTTPS

# Asegurar que:
# - Backend fuerza HTTPS
# - Frontend hace requests a HTTPS
# - Cookies son Secure + HttpOnly + SameSite
```

### 5.5 Base de Datos Segura

```bash
# Railway PostgreSQL viene con:
# ✅ Conexiones encriptadas (SSL)
# ✅ Backups automáticos
# ✅ Acceso aislado

# Verificar que DATABASE_URL usa:
# postgresql://user:pass@host:5432/db?sslmode=require
```

---

## 📊 PARTE 6: Monitoreo y Mantenimiento

### 6.1 Health Checks

```bash
# Verificar que APIs están vivas
curl https://tu-api.ejemplo.com/health

# Si responde JSON con status=healthy, está bien
```

### 6.2 Logs en Producción

```bash
# Railway
railway logs
railway logs --service=fastapi

# Vercel
# Dashboard > Deployments > Click uno > Logs
```

### 6.3 Database Backups

```bash
# Railway hace backups automáticos
# Configurar en Railway > Settings > Backups
# Retención: 30 días (recomendado)

# Download manual
# Railway > PostgreSQL > Settings > Backups > Download
```

### 6.4 Monitoreo Semanal

- [ ] Revisar logs de errores
- [ ] Verificar health checks
- [ ] Comprobar que las APIs responden
- [ ] Ver storage de BD
- [ ] Revisar certificados SSL (~30 días antes de expirar)

---

## 🚨 Troubleshooting

### "CORS Error en Frontend"

```bash
# Problema: Frontend no puede conectarse a API

# Soluciones:
# 1. Verificar ALLOWED_ORIGINS en Railway
# 2. Verificar VITE_API_URL en Vercel
# 3. Asegurar que ambas uses HTTPS
# 4. Esperar ~5 min después de cambiar variables
```

### "502 Bad Gateway"

```bash
# Problema: API no responde

# Soluciones:
# 1. Verificar logs: railway logs
# 2. Revisar variables de entorno
# 3. Checar DATABASE_URL
# 4. Ejecutar migraciones: railway run alembic upgrade head
# 5. Reiniciar servicio en Railway
```

### "Database Connection Failed"

```bash
# Problema: API no puede conectarse a BD

# Soluciones:
# 1. Verificar DATABASE_URL en Railway
# 2. Checar que PostgreSQL está corriendo
# 3. Ver usuario/password correcto
# 4. Ejecutar: railway run python -c "import sqlalchemy"
```

### "Build Fails en Vercel"

```bash
# Problema: Build de Vite falla

# Soluciones:
# 1. npm run build localmente, ver error
# 2. Verificar que tsc compila: npm run build
# 3. Limpiar cache: npm run clean && npm install
# 4. Revisar logs en Vercel
```

---

## ✅ Checklist Pre-Producción

- [ ] Database migrations ejecutadas (`alembic upgrade head`)
- [ ] Variables de entorno configuradas (Railway + Vercel)
- [ ] JWT_SECRET_KEY es fuerte (32+ chars random)
- [ ] ALLOWED_ORIGINS apunta a tu frontend
- [ ] VITE_API_URL apunta a tu backend
- [ ] SSL certificates válidos (Vercel + Railway auto)
- [ ] Health checks responden 200
- [ ] Login funciona end-to-end
- [ ] Datos sensibles NO están en código
- [ ] .gitignore excluye .env
- [ ] Backups automáticos configurados
- [ ] Monitoreo y alertas activos

---

## ✅ Checklist Post-Deploy

- [ ] Frontend carga en navegador
- [ ] Puedo hacer login
- [ ] APIs responden con datos
- [ ] Puedo crear un entrenamiento
- [ ] Puedo registrar una medida
- [ ] Los datos se guardan en BD
- [ ] Logout funciona
- [ ] Session se mantiene al refrescar
- [ ] Mensajes de error son claros
- [ ] Mobile responsive

---

## 📞 Support & Troubleshooting

Si algo no funciona:

1. **Revisar logs**
   - Railway: `railway logs`
   - Vercel: Dashboard > Logs
   
2. **Verificar variables de entorno**
   - Railway: Settings > Variables
   - Vercel: Settings > Environment Variables
   
3. **Ejecutar health checks**
   - Backend: `curl https://api.ejemplo.com/health`
   - Frontend: Abrir dev tools > Network
   
4. **Buscar solución**
   - [Railway Docs](https://docs.railway.app/)
   - [Vercel Docs](https://vercel.com/docs)
   - [FastAPI Docs](https://fastapi.tiangolo.com/)

---

**Última actualización**: Octubre 22, 2026  
**Estado**: ✅ Production Ready