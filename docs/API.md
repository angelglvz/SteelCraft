# Documentación de la API - SteelCraft 🏋️‍♂️

SteelCraft es una API RESTful desarrollada con **FastAPI**, **SQLAlchemy** y **PostgreSQL**, diseñada para la gestión integral de entrenamientos, catálogo de ejercicios y medidas corporales con aislamiento estricto por usuario mediante **JWT**.

* **Base URL:** `http://localhost:8000`
* **Documentación Interactiva (Swagger):** `/docs`
* **Documentación Alternativa (ReDoc):** `/redoc`

---

## 🔐 1. Autenticación (`/auth`)
Endpoints encargados de la gestión de usuarios y generación de tokens de acceso seguro.

| Método | Endpoint | Descripción | Autenticación |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/token` | Inicia sesión y devuelve el token JWT Bearer. | No requerida |
| `POST` | `/auth/register` | Registra un nuevo usuario en el sistema. | No requerida |

---

## 🦾 2. Catálogo de Músculos (`/muscles`)
Gestión del catálogo maestro de grupos musculares.

| Método | Endpoint | Descripción | Autenticación |
| :--- | :--- | :--- | :--- |
| `GET` | `/muscles/` | Lista todos los músculos disponibles en el catálogo. | Sí (Bearer) |
| `POST` | `/muscles/` | Añade un nuevo músculo al catálogo. | Sí (Admin/Bearer) |

---

## 🏋️‍♂️ 3. Catálogo de Ejercicios (`/exercises`)
Gestión de ejercicios y sus relaciones con los grupos musculares (principales y secundarios).

| Método | Endpoint | Descripción | Autenticación |
| :--- | :--- | :--- | :--- |
| `GET` | `/exercises/` | Lista los ejercicios del catálogo con sus músculos implicados. | Sí (Bearer) |
| `POST` | `/exercises/` | Crea un nuevo ejercicio en el catálogo. | Sí (Admin/Bearer) |

---

## 📏 4. Medidas Corporales (`/measurements`)
Seguimiento de la evolución física del usuario (peso, altura, grasa corporal).

| Método | Endpoint | Descripción | Autenticación |
| :--- | :--- | :--- | :--- |
| `GET` | `/measurements/` | Devuelve el historial completo de medidas del usuario. | Sí (Bearer) |
| `POST` | `/measurements/` | Registra una nueva medida corporal. | Sí (Bearer) |
| `DELETE` | `/measurements/{id}` | Elimina un registro de medida propio. | Sí (Bearer) |

---

## 📋 5. Entrenamientos (`/workouts`)
Núcleo de la aplicación. Permite registrar entrenamientos completos de forma anidada (Cabecera ➔ Ejercicios ➔ Series/SetLog).

| Método | Endpoint | Descripción | Autenticación |
| :--- | :--- | :--- | :--- |
| `GET` | `/workouts/` | Devuelve los entrenamientos del usuario ordenados por fecha. | Sí (Bearer) |
| `POST` | `/workouts/` | Registra un entrenamiento completo con ejercicios y series. | Sí (Bearer) |
| `DELETE` | `/workouts/{id}` | Elimina un entrenamiento y sus series asociadas (cascada). | Sí (Bearer) |