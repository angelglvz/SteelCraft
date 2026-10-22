# 🔒 Política de Seguridad y Privacidad - SteelCraft v1.0

Documento que describe las medidas de seguridad, privacidad y protección de datos implementadas en SteelCraft.

---

## 📋 Tabla de Contenidos

1. [Seguridad General](#seguridad-general)
2. [Autenticación y Autorización](#autenticación-y-autorización)
3. [Protección de Datos](#protección-de-datos)
4. [Privacidad RGPD](#privacidad-rgpd)
5. [Vulnerabilidades Conocidas](#vulnerabilidades-conocidas)
6. [Reportar Vulnerabilidades](#reportar-vulnerabilidades)
7. [Auditoría y Compliance](#auditoría-y-compliance)

---

## 🔐 Seguridad General

### Infraestructura

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| HTTPS | ✅ Obligatorio | Railway + Vercel auto-providencian SSL |
| HTTP Redirect | ✅ Habilitado | Todo HTTP redirecciona a HTTPS |
| CORS | ✅ Configurado | Whitelist de dominios permitidos |
| Security Headers | ✅ Implementado | X-Frame-Options, X-Content-Type-Options, etc |
| Dependencias | ✅ Monitoreadas | npm/pip audit regularmente |
| Environment | ✅ Separado | Dev ≠ Staging ≠ Production |

### Attack Surface

```
Medidas implementadas:
✅ Input validation en todos los endpoints
✅ Rate limiting (implementable via middleware)
✅ CSRF tokens en formularios
✅ SQL Injection prevention (SQLAlchemy ORM)
✅ XSS prevention (React auto-escapes)
✅ Command injection prevention (no shell commands)
✅ Timing attack prevention (constant-time comparisons)
```

---

## 🔑 Autenticación y Autorización

### Autenticación

#### JWT Tokens
```
- Algoritmo: HS256 (HMAC-SHA256)
- Expiración: 30 minutos (configurable)
- Refresh: Válido 7 días (configurable)
- Secret Key: Min 32 caracteres random
- Payload Seguro: No contiene contraseña
```

#### Contraseñas
```
- Hash: bcrypt 12 rounds
- Nunca: Se almacenan en texto plano
- Nunca: Se envían por email
- Nunca: Se loguean
- Reset: Via token temporal (no implementado en v1.0)
```

#### Validaciones
```python
# Requisitos de contraseña
- Mínimo 8 caracteres
- Se valida en el backend
- Se valida en el frontend (UX)
- Expresión regular: ^.{8,}$
```

### Autorización

#### Roles
```
User (default):
  - Ver propios entrenamientos
  - Crear/editar propios entrenamientos
  - Ver propias medidas
  - Ver perfil propio
  - Crear/editar perfil propio

Admin:
  - Todo lo que puede User
  - Ver todos los usuarios
  - Crear/editar ejercicios
  - Crear/editar músculos
  - Moderar contenido
  - Acceso a datos no-personales
```

#### Control de Acceso
```
- Validación por rol en cada endpoint
- Validación por propietario en recursos
- No se exponen IDs de otros usuarios
- No se permite acceso cruzado a datos
```

### Tokens JWT

```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "user",
  "exp": 1698246372,  # 30 min desde issue
  "iat": 1698244572
}

Signature:
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret_key
)
```

---

## 📊 Protección de Datos

### Clasificación de Datos

#### Nivel 1: Públicos
```
- Nombres de ejercicios
- Grupos musculares
- Descripciones de ejercicios
```

#### Nivel 2: Internos
```
- IDs de usuarios
- Roles
- Datos de navegación
```

#### Nivel 3: Confidenciales
```
- Emails
- Nombres completos
- Histórico de entrenamientos
- Medidas corporales (datos de salud)
```

#### Nivel 4: Críticos
```
- Contraseñas (hashed)
- JWT tokens
- Claves de API (futuro)
```

### Almacenamiento

| Dato | Almacenamiento | Encriptación | Acceso |
|------|---|---|---|
| Contraseña | BD (hash) | bcrypt | Solo comparación |
| Token | Session | HTTPS | Frontend solo |
| Email | BD | Plain | Autenticación |
| Medidas | BD | Plain | Solo propietario |
| Nombre | BD | Plain | Solo propietario |

### En Tránsito

```
- HTTPS obligatorio (TLS 1.2+)
- Certificados SSL válidos
- Cookies: Secure + HttpOnly + SameSite=Strict
- Compresión: Habilitada (gzip)
- Headers: Security headers configurados
```

### Encriptación End-to-End

```
Actual:
✅ HTTPS/TLS (en tránsito)
❌ Client-side encryption (no implementado)

Futuro (v2.0):
- Posible encriptación E2E para medidas sensibles
- Posible key derivation con password
```

---

## 👥 Privacidad RGPD

### Consentimiento

- [ ] Política de privacidad clara en login
- [ ] Aceptación explícita de términos
- [ ] Derecho a rechazar tracking (cookies no-esenciales)

### Derechos del Usuario

#### Derecho de Acceso
```
Usuario puede:
✅ Ver sus propios datos (API /users/me)
✅ Exportar datos (futura feature)
```

#### Derecho al Olvido
```
Usuario puede:
✅ Solicitar eliminación de cuenta
✅ Todos sus datos se borran (cascade)
✅ No se guardan backups con sus datos (futuro)
```

#### Portabilidad
```
Usuario puede:
❌ Exportar a JSON (no implementado)
❌ Exportar a CSV (no implementado)

Futuro:
- Endpoint /users/me/export
- Formato JSON
- Incluye: entrenamientos, medidas, perfil
```

#### Rectificación
```
Usuario puede:
✅ Actualizar perfil (PUT /users/me)
✅ Cambiar email (POST /users/change-email)
✅ Cambiar contraseña (POST /users/change-password)
```

### Cookies y Tracking

```
Cookies esenciales:
- auth_token (JWT)
- session_id (si aplica)

Cookies no-esenciales:
❌ Analytics (no implementado)
❌ Tracking (no implementado)

Cookies futuro:
- Google Analytics (con consentimiento)
- Hotjar (opcional)
```

### Datos Personales

```
Cuáles datos recopilamos:
- Email
- Contraseña (hashed)
- Nombre completo
- Entrenamientos
- Medidas corporales
- Avatar (opcional)

Qué NO recopilamos:
- Ubicación
- Datos de navegación
- Identificadores de dispositivo
- Analytics de comportamiento
- IP (no loguada)
```

### Política de Retención

```
Datos mientras usuario tenga cuenta:
- Perfil: Indefinido
- Entrenamientos: Indefinido
- Medidas: Indefinido

Después de eliminación:
- Borrado completo (GDPR Art. 17)
- Backups: 30 días (después se elimina)
- Logs: 7 días
- Nada recuperable
```

---

## 🚨 Vulnerabilidades Conocidas

### No Hay Vulnerabilidades Conocidas en v1.0

Sin embargo, áreas de riesgo potencial:

#### Baja Prioridad
```
- Rate limiting no implementado
  → Mitigación: Railway ofrece DDoS protection
  → Futuro: Agregar rate limiting middleware
  
- Password reset no implementado
  → Mitigación: Usuarios crean cuenta nueva
  → Futuro: Implementar reset seguro via email
  
- 2FA no implementado
  → Mitigación: Contraseñas fuertes obligatorias
  → Futuro: TOTP/SMS 2FA
```

#### Media Prioridad
```
- Logs en texto plano
  → Mitigación: Logs en Railway (infraestructura segura)
  → Futuro: Encripción de logs sensibles
  
- Exportación de datos no disponible
  → Mitigación: Usuario puede descargar manualmente
  → Futuro: GDPR export endpoint
```

#### Cosas que SÍ tenemos
```
✅ SQL Injection protection (SQLAlchemy ORM)
✅ XSS prevention (React auto-escapes)
✅ CSRF protection (validación backend)
✅ Timing attacks prevention (bcrypt)
✅ Dependency scanning (npm audit)
✅ Secure random generation (secrets module)
```

---

## 🐛 Reportar Vulnerabilidades

### IMPORTANTE: Responsabilidad

**NO reportes vulnerabilidades en:**
- Issues públicos de GitHub
- Redes sociales
- Emails públicos

**SÍ reporta vulnerabilidades a:**

```
Email: security@steelcraft.app
(Reemplazar con email real si existe)

Incluir:
1. Descripción de la vulnerabilidad
2. Pasos para reproducir
3. Impacto potencial
4. Versión afectada
5. Tu contacto (opcional)
```

### Proceso

```
1. Recibes respuesta en 48 horas
2. Trabajamos en fix
3. Publicamos patch
4. Crédito en SECURITY.md (con permiso)
5. Embargo: 30 días desde fix hasta disclosure
```

### Garantías

```
✅ No preseguiremos investigaciones buenas
✅ Trabajaremos con ti cooperativamente
✅ Confidencialidad hasta el fix
✅ Crédito público si lo deseas
```

---

## 📊 Auditoría y Compliance

### Seguridad de Dependencias

```bash
# Verificar vulnerabilidades
npm audit
pip audit

# Actualizar dependencias
npm update --save
pip install --upgrade -r requirements.txt
```

### Checklist de Seguridad

#### Autenticación
- [x] Contraseñas hasheadas (bcrypt)
- [x] JWT tokens con expiración
- [x] Validación de tokens en cada request
- [x] Protección contra token theft
- [x] Refresh tokens implementados

#### Autorización
- [x] Validación de roles
- [x] Validación de propietario
- [x] Aislamiento de datos por usuario
- [x] Admin separation

#### Datos
- [x] HTTPS/TLS obligatorio
- [x] Sin datos sensibles en logs
- [x] Sin datos sensibles en URLs
- [x] Validación de entrada
- [x] Sanitización de output

#### Infraestructura
- [x] Database en contenedor aislado
- [x] Secrets en variables de entorno
- [x] Backups automáticos
- [x] SSL certificates válidos
- [x] CORS configurado

#### Development
- [x] .gitignore excluye secrets
- [x] .env.example sin valores reales
- [x] Dependencias auditadas
- [x] Code review antes de merge
- [x] Logging seguro

### Testing de Seguridad

#### Manual Testing
```bash
# Test CORS
curl -H "Origin: http://hacker.com" http://localhost:8000/api

# Test auth bypass
curl http://localhost:8000/api/users/me -H "Authorization: Bearer invalid"

# Test SQL injection
curl "http://localhost:8000/api/exercises?search='; DROP TABLE--"

# Test XSS
curl -X POST http://localhost:8000/api/workouts \
  -d '{"name":"<script>alert(1)</script>"}'
```

#### Automated Testing
```bash
# OWASP ZAP
zap.sh -cmd -quickurl http://localhost:8000

# npm audit
npm audit

# pip audit
pip audit
```

---

## 📝 Historial de Seguridad

### v1.0.0 (2026-10-22)

- ✅ Seguridad inicial completa
- ✅ JWT tokens
- ✅ Contraseñas bcrypt
- ✅ CORS configuration
- ✅ Input validation
- ✅ No vulnerabilidades reportadas

---

## 🔄 Actualizaciones de Seguridad

### Cadencia de Revisión
```
- Diaria: Logs y alertas
- Semanal: Dependency updates
- Mensual: Security audit completo
- Trimestral: Penetration testing (futuro)
```

### Comunicación

Si se descubre una vulnerabilidad:
1. Se avisará a usuarios afectados
2. Se publicará patch
3. Se actualizará esta política
4. Se publicará postmortem (si crítica)

---

## 📞 Contacto

**Preguntas de Seguridad**:
- Email: security@steelcraft.app (si existe)
- GitHub Issues: [Security label](https://github.com/angelglvz/SteelCraft/labels/security)

**Otros contactos**:
- Reporte de bugs: GitHub Issues
- Feature requests: GitHub Discussions
- Feedback general: GitHub Issues

---

## 📚 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [GDPR Compliance](https://gdpr-info.eu/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)

---

**Última actualización**: Octubre 22, 2026  
**Versión**: 1.0  
**Estado**: ✅ Production Ready

*Esta política está sujeta a cambios. Se notificará a usuarios de cambios significativos.*