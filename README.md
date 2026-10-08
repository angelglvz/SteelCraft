# SteelCraft

Plataforma modular para registrar y revisar tu progreso en el gimnasio: entrenos, series, medidas corporales y, en el futuro, recomendaciones para mejorar tu entrenamiento.

> **Estado:** en diseño. El alcance y el stack se están definiendo; este documento se actualizará a medida que avance el proyecto.

## Objetivo

SteelCraft es una serie de aplicaciones conectadas entre sí. Su base es un núcleo de datos con API que centraliza la información de los usuarios, y sobre él se construirán clientes y herramientas complementarias. El proyecto nace como herramienta de uso personal, con la intención de abrirse a un grupo reducido de usuarios y servir como proyecto de portfolio.

## Alcance actual (programa 1: núcleo de datos y API)

- Usuarios multiusuario con registro, autenticación y datos aislados por usuario.
- Roles básicos: usuario y administrador.
- Mediciones corporales con histórico (peso, altura, porcentaje de grasa...), introducidas manualmente.
- Catálogo común de ejercicios, con los músculos que trabaja cada uno (primarios y secundarios) y una vista anatómica para visualizarlos.
- Registro de entrenos con ejercicios y series variables, cada una con sus repeticiones y su peso.

**Fuera de alcance por ahora:** interfaz de usuario, recomendaciones de entrenamiento, rutinas planificadas e integración con básculas inteligentes.

## Hoja de ruta

1. Núcleo de datos y API (en diseño).
2. Importador del histórico de entrenos desde un export de Telegram (candidato).
3. Clientes web y/o móvil.
4. Módulo de consejos de entrenamiento.

## Stack previsto

Python 3, FastAPI, SQLAlchemy, Alembic y PostgreSQL (en Docker). Sujeto a confirmación.

## Privacidad y seguridad

- Las contraseñas se almacenan únicamente como hash con sal (nunca en claro ni reversibles).
- Los datos corporales son datos de salud: solo son accesibles por su propietario.
- Los archivos de datos personales (exportaciones, `.env`, CSV) no se incluyen en el repositorio.

## Licencia

Por definir.