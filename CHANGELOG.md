# Changelog

Todas las cambios notables en SteelCraft serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-22

### ✨ Added (Características Nuevas)

#### Backend
- ✅ **Autenticación JWT** - Login, registro, refresh tokens
- ✅ **Modelos SQLAlchemy** - User, Exercise, Muscle, Workout, Measurement, Set
- ✅ **API REST Completa** - 50+ endpoints documentados
- ✅ **Migraciones Alembic** - Versionado de base de datos
- ✅ **Validación Pydantic** - Schemas para todas las APIs
- ✅ **CORS Configurado** - Desarrollo y producción
- ✅ **Documentación Swagger** - Auto-generada en /docs
- ✅ **Error Handling** - Excepciones estructuradas
- ✅ **Database Seeding** - Scripts para datos iniciales
- ✅ **PostgreSQL 17** - Base de datos containerizada

#### Frontend
- ✅ **React 19 + TypeScript** - Aplicación SPA moderna
- ✅ **Tailwind CSS v4** - Styling responsive
- ✅ **8 Vistas Completas**:
  - Login - Autenticación con JWT
  - RegisterView - Registro de usuarios
  - ExercisesView - Catálogo y CRUD de ejercicios
  - MusclesView - Gestión de grupos musculares
  - WorkoutsView - Crear y listar entrenamientos
  - WorkoutsHistoryView - Histórico temporal
  - MeasurementsView - Tracking de medidas corporales
  - ProfileView - Datos del usuario
- ✅ **React Router** - Navegación cliente-side
- ✅ **Axios** - HTTP client tipado
- ✅ **React Context** - Gestión de autenticación
- ✅ **Lucide Icons** - Iconos SVG
- ✅ **Responsive Design** - Mobile, tablet, desktop

#### Sistema de Diseño
- ✅ **Design System Centralizado** - tokens.css + tailwind.config.ts
- ✅ **10 Colores Principales** - Paleta consistente
- ✅ **7 Tamaños de Fuente** - Jerarquía tipográfica
- ✅ **8 Espaciados** - Sistema 8px base
- ✅ **9 Border Radius** - Cards, inputs, pills, buttons
- ✅ **3 Sombras** - Elevación y profundidad
- ✅ **Variables CSS** - Reutilizables en CSS, JS y Tailwind
- ✅ **Guía de Diseño Completa** - DESIGN_SYSTEM_GUIDE.md
- ✅ **Theme TypeScript** - Constantes para lógica

#### DevOps
- ✅ **Docker & Docker Compose** - Entorno reproducible
- ✅ **PostgreSQL 17 en Docker** - Base de datos normalizada
- ✅ **Vite** - Build tool moderno y rápido
- ✅ **ESLint + TypeScript** - Calidad de código
- ✅ **PostCSS + Autoprefixer** - Procesamiento CSS

#### Seguridad
- ✅ **Contraseñas Hasheadas** - bcrypt 12 rounds
- ✅ **JWT Tokens** - Con expiración configurable
- ✅ **CORS Protection** - Configurable por ambiente
- ✅ **Input Validation** - Pydantic + Tailwind
- ✅ **SQL Injection Prevention** - SQLAlchemy ORM
- ✅ **Aislamiento de Datos** - Datos por usuario

#### Documentación
- ✅ **README Completo** - Setup, features, deployment
- ✅ **API Documentation** - docs/API.md (Swagger auto)
- ✅ **Design System Guide** - frontend/DESIGN_SYSTEM_GUIDE.md
- ✅ **Deployment Guide** - docs/deployment.md
- ✅ **Security Policy** - docs/SECURITY.md
- ✅ **CHANGELOG** - Este archivo

### 🔧 Changed (Cambios)

- Actualizado README para v1.0 production-ready
- Refactorización completa del frontend para usar Design System
- Migración de Tailwind CSS genérico a tokens centralizados
- Implementación de theme oscuro con paleta profesional

### 🐛 Fixed (Correcciones)

- Corregidos problemas de contraste en formularios
- Solucionado CORS para desarrollo y producción
- Arreglados estilos responsive en vistas móviles

### 📊 Performance

- ✅ Frontend bundle optimizado con Vite (~240KB gzipped)
- ✅ Lazy loading en rutas con React Router
- ✅ Optimización de imágenes (SVG icons)
- ✅ CSS purging con Tailwind v4

### 🔒 Security

- ✅ Todas las contraseñas hasheadas
- ✅ JWT tokens con expiración
- ✅ CORS configurado correctamente
- ✅ Validación en todos los endpoints
- ✅ Protección contra SQL injection
- ✅ HTTPS ready para producción

### 📝 Notes

- Este es el release inicial oficial de SteelCraft
- Completamente funcional y listo para producción
- Todas las features core implementadas
- Base sólida para futuras extensiones

---

## Roadmap para Futuras Versiones

### v1.1.0 (Planeado)
- [ ] Gráficas de progreso (Chart.js/Recharts)
- [ ] Exportar datos (CSV, PDF)
- [ ] Tema claro/oscuro configurable
- [ ] Modo offline (Service Workers)

### v2.0.0 (Planeado)
- [ ] App móvil (React Native)
- [ ] Recomendaciones IA (OpenAI)
- [ ] Importar entrenamientos desde Telegram
- [ ] Sistema de rutinas planificadas

### v3.0.0 (Futuro)
- [ ] Social features (compartir entrenamientos)
- [ ] Integración con básculas inteligentes
- [ ] API pública para integraciones
- [ ] Sistema de suscripciones

---

## Cómo Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para directrices.

---

## Versionado

Seguimos [Semantic Versioning](https://semver.org/):
- MAJOR - Cambios incompatibles
- MINOR - Nuevas features compatibles
- PATCH - Correcciones de bugs

---

**Última actualización**: Octubre 22, 2026