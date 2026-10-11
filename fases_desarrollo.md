# Hoja de Ruta del Frontend - SteelCraft 🚀

Este documento detalla las fases y puntos clave para el desarrollo del frontend de **SteelCraft** utilizando **React + TypeScript** y **Tailwind CSS**, asegurando una arquitectura limpia, escalable y conectada con la API de FastAPI.

---

## 🧱 Fase 1: Cimientos (Tipos y Servicios API)
Definición de las estructuras de datos y la capa de comunicación con el servidor.

* **1. Interfaces TypeScript (`src/types/`):** Creación de los tipos que mapean exactamente los esquemas Pydantic del backend (`User`, `Exercise`, `Muscle`, `Workout`, `SetLog`, `Measurement`).
* **2. Servicios API (`src/services/`):** Modularización de las peticiones HTTP con Axios por dominios funcionales (ej. `authService.ts`, `exerciseService.ts`, `workoutService.ts`, `measurementService.ts`).

---

## 🔐 Fase 2: Autenticación y Control de Acceso
Gestión de la seguridad y el flujo de sesiones de usuario.

* **3. Contexto de Autenticación:** Administración global del token JWT, datos del usuario actual y persistencia mediante `localStorage`.
* **4. Vistas de Acceso (`src/pages/`):** Pantallas de **Login** y **Registro** conectadas con los endpoints `/auth/token` y `/auth/register`.
* **5. Rutas Protegidas:** Componente de enrutamiento para restringir el acceso al panel principal a usuarios no autenticados.

---

## 🏋️‍♂️ Fase 3: Pantallas Clave y Funcionalidad Core
Desarrollo de las características principales orientadas al entrenamiento físico.

* **6. Dashboard Principal (`src/pages/Dashboard.tsx`):** Resumen de actividad reciente, accesos directos y estadísticas rápidas del usuario.
* **7. Catálogo de Ejercicios y Músculos:** Visualización clara de los grupos musculares y ejercicios disponibles en la base de datos.
* **8. Registro de Entrenamientos (Core):** Formulario dinámico avanzado para registrar entrenamientos completos de forma anidada (Entrenamiento ➔ Ejercicios ➔ Series con repeticiones y peso).
* **9. Medidas Corporales:** Historial de evolución física y formularios para registrar nuevas mediciones de peso, altura y grasa corporal.

---

## 🎨 Fase 4: Pulido y Experiencia de Usuario (UX)
Optimización final de la interfaz y la experiencia de uso.

* **10. Diseño Responsive con Tailwind:** Adaptabilidad fluida para que la aplicación sea cómoda de usar tanto en escritorio como directamente desde el móvil en el gimnasio.
* **11. Gráficas de Evolución:** Integración de librerías visuales (como Recharts) para mostrar de forma gráfica la progresión de cargas y peso corporal.