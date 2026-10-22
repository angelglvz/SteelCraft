# 💪 SteelCraft v1.0

[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=flat-square)](https://github.com/angelglvz/SteelCraft)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11%2B-3776ab?style=flat-square&logo=python)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)

**SteelCraft** es una plataforma web completa para **registrar, seguir y analizar tu progreso en el gimnasio**: entrenamientos, ejercicios, series, medidas corporales y progreso muscular.

Diseñada con autenticación JWT segura, arquitectura modular y preparada para producción. Backend robusto + Frontend moderno con sistema de diseño centralizado.

---

## ✨ Características v1.0

### ✅ Core Completo
- ✅ **Autenticación JWT** con registro y login
- ✅ **Multiusuario** - Datos completamente aislados por usuario
- ✅ **Roles**: Admin y User con permisos diferenciados
- ✅ **Catálogo de Ejercicios** - 100+ ejercicios con músculos primarios/secundarios
- ✅ **Registro de Entrenamientos** - Sesiones con ejercicios y series variables
- ✅ **Medidas Corporales** - Histórico completo (peso, altura, porcentaje grasa, etc.)
- ✅ **Gestión de Músculos** - Vista completa con relaciones a ejercicios
- ✅ **Histórico de Entrenamientos** - Seguimiento temporal
- ✅ **Perfil de Usuario** - Datos personales y configuración

### 🎨 Frontend Moderno
- ✅ **React 19** con TypeScript
- ✅ **Tailwind CSS v4** - Diseño limpio y responsive
- ✅ **Sistema de Tokens Centralizado** - Colores, tipografía, espaciado consistentes
- ✅ **8 Vistas Completamente Funcionales**
- ✅ **Navegación intuitiva** con menú sidebar
- ✅ **Responsive Design** - Mobile, tablet, desktop

### 🔒 Seguridad & Privacidad
- ✅ **Contraseñas hasheadas** con bcrypt (nunca en claro)
- ✅ **JWT tokens** con expiración
- ✅ **CORS configurado** para desarrollo y producción
- ✅ **Datos de salud protegidos** - Acceso solo al propietario
- ✅ **Validación de entrada** en todas las APIs
- ✅ **SQL injection prevention** - SQLAlchemy ORM

### 🚀 DevOps & Deployment Ready
- ✅ **Docker & Docker Compose** - Entorno normalizado
- ✅ **PostgreSQL 17** en contenedor
- ✅ **Alembic migrations** - Versionado de BD
- ✅ **Variables de entorno** configuradas
- ✅ **Guía de deployment** para Railway/Vercel

---

## 🛠️ Tech Stack

### Backend
```
FastAPI 0.100+          → API REST moderno y rápido
Python 3.11+            → Lenguaje
SQLAlchemy 2.0+         → ORM robusto
Alembic 1.12+           → Migraciones de BD
PostgreSQL 17           → Base de datos (Docker)
Pydantic 2.0+           → Validación de datos
python-jose             → JWT tokens
bcrypt                  → Hash de contraseñas
python-multipart        → File uploads
CORS middleware         → Cross-origin requests
```

### Frontend
```
React 19.2.8            → Framework UI
TypeScript 6.0.2        → Type safety
Vite 8.3.0              → Build tool
Tailwind CSS 4.3.3      → Styling
React Router 7.18.4     → Client routing
Axios 1.20.0            → HTTP client
Lucide React 1.55.0     → Icons
PostCSS 8.5.29          → CSS processing
ESLint 10.10.0          → Linting
```

### DevOps
```
Docker & Docker Compose → Containerización
PostgreSQL 17           → Base de datos
Git                     → Version control
```

---

## 📊 Estructura del Proyecto

```
SteelCraft/
│
├── backend/ (FastAPI)
│   ├── core/
│   │   ├── app/
│   │   │   ├── api/              # Rutas y endpoints
│   │   │   ├── models/           # Modelos SQLAlchemy
│   │   │   ├── schemas/          # Pydantic schemas
│   │   │   ├── services/         # Lógica de negocio
│   │   │   ├── middleware/       # CORS, autenticación
│   │   │   └── utils/            # Utilidades
│   │   ├── alembic/              # Migraciones de BD
│   │   └── alembic.ini
│   ├── requirements.txt           # Dependencias Python
│   └── docker-compose.yml         # Servicios (DB, API)
│
├── frontend/ (React + Tailwind)
│   ├── src/
│   │   ├── pages/                # 8 vistas principales
│   │   │   ├── Login.tsx
│   │   │   ├── RegisterView.tsx
│   │   │   ├── ExercisesView.tsx
│   │   │   ├── MusclesView.tsx
│   │   │   ├── WorkoutsView.tsx
│   │   │   ├── WorkoutsHistoryView.tsx
│   │   │   ├── MeasurementsView.tsx
│   │   │   └── ProfileView.tsx
│   │   ├── components/           # Componentes reutilizables
│   │   ├── services/             # Llamadas a API (Axios)
│   │   ├── context/              # React Context (Auth)
│   │   ├── styles/               # 🆕 Sistema de tokens
│   │   │   ├── tokens.css        # Variables CSS centralizadas
│   │   │   └── theme.ts          # Constantes TypeScript
│   │   ├── types/                # TypeScript types
│   │   └── index.css             # Importa tokens.css
│   ├── tailwind.config.ts         # Configuración Tailwind
│   ├── postcss.config.js          # PostCSS para Tailwind v4
│   ├── package.json               # Dependencias npm
│   ├── vite.config.ts             # Configuración Vite
│   └── DESIGN_SYSTEM_GUIDE.md     # Documentación de tokens
│
├── importer/
│   ├── import_telegram.py         # Script importar entrenos
│   ├── parse_telegram.py
│   └── seed_muscles.py            # Script seed BD
│
├── docs/
│   └── API.md                     # Documentación endpoints
│
├── docker-compose.yml             # Compose para dev
├── requirements.txt               # Deps root
└── README.md                      # Este archivo
```

---

## 🚀 Quick Start (Desarrollo)

### Requisitos Previos
- Docker & Docker Compose
- Node.js 18+ y npm
- Python 3.11+ (opcional si usas Docker)

### 1️⃣ Clonar Repositorio
```bash
git clone https://github.com/angelglvz/SteelCraft.git
cd SteelCraft
```

### 2️⃣ Levantar Backend + Base de Datos
```bash
# Desde raíz del proyecto
docker-compose up -d

# Esto inicia:
# - PostgreSQL 17 en localhost:5432
# - FastAPI en localhost:8000
```

### 3️⃣ Instalar y Ejecutar Frontend
```bash
cd frontend

# Instalar dependencias
npm install

# Instalar @tailwindcss/postcss para Tailwind v4
npm install -D @tailwindcss/postcss

# Dev server
npm run dev

# Frontend en http://localhost:5173
```

### 4️⃣ Verificar que Todo Funciona
```bash
# Backend API
curl http://localhost:8000/docs

# Frontend
open http://localhost:5173
```

---

## 🔧 Setup Completo (Desarrollo)

### Backend Setup Detallado

```bash
# 1. Variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 2. Levantar contenedores
docker-compose up -d

# 3. Ejecutar migraciones
docker-compose exec fastapi alembic upgrade head

# 4. Seed de datos (opcional)
docker-compose exec fastapi python /app/importer/seed_muscles.py

# 5. API disponible en
# http://localhost:8000
# http://localhost:8000/docs (Swagger)
# http://localhost:8000/redoc (ReDoc)
```

### Frontend Setup Detallado

```bash
cd frontend

# 1. Instalar dependencias (incluida Tailwind v4)
npm install
npm install -D @tailwindcss/postcss

# 2. Variables de entorno
cat > .env << EOF
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=SteelCraft
EOF

# 3. Development server
npm run dev

# 4. Build para producción
npm run build

# 5. Preview build
npm run preview

# 6. Linting
npm run lint
```

---

## 📚 API Documentation

### Autenticación
```bash
# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Respuesta
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {...}
}
```

### Endpoints Principales
- `GET /api/exercises` - Listar ejercicios
- `POST /api/exercises` - Crear ejercicio (admin)
- `GET /api/workouts` - Listar entrenamientos del usuario
- `POST /api/workouts` - Crear entrenamiento
- `GET /api/measurements` - Histó­rico de medidas
- `POST /api/measurements` - Registrar medida
- `GET /api/muscles` - Listar músculos
- `GET /api/users/me` - Datos del usuario autenticado

Documentación completa en: [docs/API.md](docs/API.md)

---

## 🚀 Deployment a Producción

### Deployment Backend (Railway)

```bash
# 1. Conectar a Railway
railway login

# 2. Crear proyecto
railway init

# 3. Agregar variables de entorno en Railway Dashboard
# - DATABASE_URL
# - JWT_SECRET_KEY
# - ENVIRONMENT=production

# 4. Deploy
railway up
```

### Deployment Frontend (Vercel)

```bash
# 1. Build
npm run build

# 2. Deploy a Vercel (conectar repo)
# - Vercel detecta automáticamente que es Vite
# - Build command: npm run build
# - Output directory: dist

# 3. Agregar variable de entorno
# VITE_API_URL=https://tu-api.railway.app/api
```

### Configuración de Producción
```bash
# Backend
ENVIRONMENT=production
DEBUG=False
ALLOWED_ORIGINS=https://tu-dominio.com
DATABASE_URL=postgresql://user:pass@prod-db:5432/steelcraft
JWT_SECRET_KEY=tu-clave-segura-larga-aqui

# Frontend
VITE_API_URL=https://tu-api.railway.app/api
VITE_APP_NAME=SteelCraft
```

Ver guía completa: [docs/deployment.md](docs/deployment.md)

---

## 🎨 Sistema de Diseño (Design System)

SteelCraft usa un **sistema de tokens centralizado** para mantener consistencia visual.

### Tokens Disponibles
- **10 Colores** predefinidos (iris-bolt, ink-charcoal, etc.)
- **7 Tamaños de fuente** (caption, body-sm, body, heading, display)
- **8 Espaciados** (8px a 64px)
- **9 Border radius** (inputs, cards, pills)
- **3 Sombras** (sm, md, subtle)

### Usar en Componentes

**Con Tailwind CSS:**
```jsx
<button className="bg-iris-bolt text-paper-white px-6 py-2 rounded-pill shadow-md">
  Click me
</button>
```

**Con CSS Variables:**
```css
.btn {
  background-color: var(--color-iris-bolt);
  color: var(--color-paper-white);
  padding: var(--spacing-16);
}
```

Ver documentación completa: [frontend/DESIGN_SYSTEM_GUIDE.md](frontend/DESIGN_SYSTEM_GUIDE.md)

---

## 🔒 Seguridad & Privacidad

### Implementado en v1.0
- ✅ **Contraseñas**: Hash con bcrypt (12 rounds), nunca en claro
- ✅ **Autenticación**: JWT con expiración configurable
- ✅ **Autorización**: Validación de roles (admin/user)
- ✅ **Datos de salud**: Acceso solo al propietario
- ✅ **CORS**: Configurado para dev y producción
- ✅ **HTTPS**: Forzado en producción
- ✅ **Input validation**: Pydantic en todas las APIs
- ✅ **SQL Injection**: SQLAlchemy ORM previene
- ✅ **Rate limiting**: Disponible via middleware
- ✅ **Cookies seguras**: HttpOnly, Secure, SameSite

### No Incluye Datos Sensibles
- `.env` nunca está en git (usar `.env.example`)
- `uploads/` (avatares) excluido
- Exportaciones de datos excluidas
- Credenciales nunca loguean

Política completa: [docs/SECURITY.md](docs/SECURITY.md)

---

## 📖 Documentación Adicional

| Documento | Contenido |
|-----------|-----------|
| [API.md](docs/API.md) | Endpoints, ejemplos, autenticación |
| [DESIGN_SYSTEM_GUIDE.md](frontend/DESIGN_SYSTEM_GUIDE.md) | Sistema de tokens, componentes |
| [deployment.md](docs/deployment.md) | Guías Railway, Vercel, Docker |
| [SECURITY.md](docs/SECURITY.md) | Políticas seguridad, privacidad |

---

## 🤝 Contributing

SteelCraft es un proyecto activo. Contribuciones bienvenidas:

1. **Fork** el repositorio
2. **Crea una rama** (`git checkout -b feature/AmazingFeature`)
3. **Commit cambios** (`git commit -m 'Add AmazingFeature'`)
4. **Push a rama** (`git push origin feature/AmazingFeature`)
5. **Abre un Pull Request**

### Normas
- Código limpio y comentado
- Tests para nuevas features
- Seguir estilos existentes (ESLint, Black)
- Documentar cambios en README

---

## 📝 Licencia

Este proyecto está bajo licencia **MIT**. Ver [LICENSE](LICENSE) para detalles.

---

## 👨‍💻 Autor

**Ángel Gamero** - Full-Stack Developer  
- GitHub: [@angelglvz](https://github.com/angelglvz)
- Portfolio: SteelCraft v1.0

---

## 🐛 Reportar Bugs

¿Encontraste un bug? [Abre un issue](https://github.com/angelglvz/SteelCraft/issues/new) describiendo:
- Pasos para reproducir
- Comportamiento esperado vs actual
- Capturas de pantalla (si aplica)
- Tu entorno (OS, navegador, versiones)

---

## 🙌 Agradecimientos

- **FastAPI** por el framework API excepcional
- **React** por la biblioteca UI moderna
- **Tailwind CSS** por el sistema de estilos utility-first
- **PostgreSQL** por la BD confiable

---

## 📈 Roadmap (v1.1+)

- [ ] Gráficas de progreso (Chart.js/Recharts)
- [ ] Importar entrenamientos desde Telegram
- [ ] Recomendaciones IA (OpenAI)
- [ ] App móvil (React Native)
- [ ] Integración con básculas inteligentes
- [ ] Sistema de rutinas planificadas
- [ ] Social features (compartir entrenamientos)
- [ ] Exportar datos (CSV, PDF)

---

## 📞 Soporte

¿Preguntas o necesitas ayuda?
- 📧 Email: contact@angelglvz.com
- 💬 GitHub Issues: [Crear issue](https://github.com/angelglvz/SteelCraft/issues)
- 🌐 Website: (próximamente)

---

**Última actualización**: Octubre 22, 2026  
**Versión**: 1.0 - Production Ready ✅  
**Estado**: ✅ Completamente funcional y desplegable