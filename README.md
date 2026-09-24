# ALPHABIT Content Management System & REST API

## Resumen Ejecutivo

Sistema integral de gestión de contenidos (CMS) y servicio backend desarrollado para la firma de diseño ALPHABIT. La plataforma centraliza la administración del portafolio corporativo, catálogo de servicios, información institucional y recepción de propuestas comerciales mediante una interfaz administrativa segura y una API RESTful de alto rendimiento.

El ciclo de ingeniería, diseño arquitectónico, implementación y despliegue del proyecto fue ejecutado en un periodo de dos semanas por el desarrollador Diego David Guevara Flores.

---

## Ficha Técnica del Proyecto

- Entidad Receptora: ALPHABIT — Estudio de Diseño
- Desarrollador Principal: Diego David Guevara Flores
- Plazo de Ejecución: 2 semanas
- Arquitectura: Full-Stack desacoplado (Node.js/Express Backend con Frontend React SPA)
- Entorno de Despliegue: Render Cloud Platform
- Nivel de Seguridad: Autenticación multifactorial mandatoria (2FA basado en SMTP), control de sesiones por tokens criptográficos y persistencia atómica en disco.

---

## Arquitectura de Software

La solución implementa una arquitectura por capas diseñada para desacoplar la lógica de presentación administrativa de los servicios de consumo público del frontend corporativo.

### Componentes del Sistema

1. Motor de Persistencia y Servidor RESTful (Backend)
   - Runtime: Node.js con TypeScript.
   - Framework HTTP: Express.js.
   - Mecanismo de Almacenamiento: Capa de persistencia en archivos planos estructurados (formato JSON normalizado) con operaciones de lectura/escritura seguras contra concurrencia.
   - Motor de Mensajería: Protocolo SMTP con pool de conexiones persistentes (Keep-Alive) y control de latencia en transporte TLS/SSL hacia Gmail API/SMTP.
   - Seguridad Criptográfica: Hashing de credenciales mediante SHA-256 con salt implícito, generación de identificadores únicos no correlacionados y códigos de autenticación aleatorios criptográficamente seguros generados vía módulo nativo `crypto`.

2. Interfaz de Administración Web (Frontend)
   - Framework: React 19 estructurado bajo Vite.
   - Tipado Estricto: TypeScript.
   - Sistema de Diseño: Tailwind CSS con componentes responsivos, estados de carga optimizados y control visual de visibilidad de contraseñas.
   - Gestión de Sesión: Almacenamiento volátil/persistente de tokens de autorización y saneamiento automático de expiraciones.

---

## Especificación de Endpoints (API RESTful)

### Autenticación y Seguridad Administrativa

- `GET /api/auth/admin-status`
  Verifica si el sistema cuenta con un administrador principal activo o si requiere inicialización.
- `POST /api/auth/admin/register`
  Permite el registro del primer administrador del sistema. Genera y despacha el primer código de validación 2FA.
- `POST /api/auth/login`
  Valida las credenciales administrativas de acceso y activa el desafío de autenticación en dos fases.
- `POST /api/auth/admin/verify-2fa`
  Valida el código temporal unívoco de 6 dígitos. Retorna el token de sesión Bearer tras la verificación exitosa.
- `POST /api/auth/admin/resend-2fa`
  Reexpide un nuevo código de seguridad, implementando una ventana de restricción temporal (cooldown de 60 segundos).
- `POST /api/auth/forgot-password`
  Inicia el flujo de recuperación de credenciales mediante despacho de código de verificación.
- `POST /api/auth/reset-password`
  Actualiza la contraseña del administrador tras comprobar la autenticidad del código 2FA.
- `GET /api/auth/me`
  Resuelve y retorna los metadatos de identidad del usuario a partir del token de autorización proporcionado en cabecera HTTP.

### Gestión de Proyectos y Portafolio

- `GET /api/projects`
  Retorna la colección completa de proyectos. Admite parámetros de consulta opcionales para filtrado por categoría (`?category=...`) y estado de publicación (`?status=published|all`).
- `GET /api/projects/:id`
  Obtiene el detalle estructurado de un proyecto específico mediante identificador o slug URL.
- `POST /api/projects`
  Crea un nuevo proyecto en el catálogo corporativo (requiere cabecera `Authorization: Bearer <token>`).
- `PUT /api/projects/:id`
  Actualiza atributos o imágenes de un proyecto existente (requiere autorización).
- `DELETE /api/projects/:id`
  Elimina un registro del repositorio (requiere autorización).

### Servicios y Contacto Comercial

- `GET /api/services`
  Retorna el catálogo de servicios ofrecidos por la empresa y sus especificaciones técnicas.
- `POST /api/services`
  Añade un nuevo servicio a la oferta corporativa (requiere autorización).
- `DELETE /api/services/:id`
  Elimina un servicio de la base de datos (requiere autorización).
- `GET /api/company-info`
  Retorna los metadatos institucionales de contacto y presencia de marca.
- `PUT /api/company-info`
  Actualiza los canales de contacto de ALPHABIT (requiere autorización).
- `POST /api/contact`
  Punto de entrada para el formulario público del sitio web. Recibe y procesa cotizaciones y mensajes entrantes.

---

## Mecanismo de Seguridad: Flujo de Autenticación de Dos Pasos (2FA)

Para salvaguardar la administración de contenidos, el sistema descarta los accesos tradicionales basados únicamente en usuario y contraseña:

1. Desafío Inicial: El usuario ingresa correo electrónico y contraseña.
2. Comprobación Criptográfica: El sistema evalúa el hash SHA-256 frente al registro almacenado.
3. Emisión de Desafío OTP: Se computa un código alfanumérico aleatorio de 6 posiciones, con caducidad fija de 10 minutos y limitación a un máximo de 5 intentos fallidos antes de ser invalidado por protección contra ataques de fuerza bruta.
4. Transporte de Clave Segura: El código se transmite a la casilla de correo del administrador mediante un canal SMTP seguro con TLS 1.3. En ningún caso el código viaja en el payload de respuesta hacia el cliente web.
5. Emisión de Token de Sesión: Una vez suministrado el código correcto, el servidor genera un token pseudoaleatorio de 64 caracteres hexadecimales que gobernará las llamadas autorizadas subsecuentes.

---

## Configuración y Variables de Entorno

El archivo `.env` o la configuración del proveedor Cloud (Render) debe contener las siguientes claves:

```env
NODE_ENV=production
PORT=3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
GMAIL_USER=tu_cuenta@dominio.com
GMAIL_APP_PASSWORD=tu_contraseña_de_aplicacion
TWO_FACTOR_CODE_EXPIRATION_MINUTES=10
```

---

## Instrucciones de Instalación y Despliegue Local

### Requisitos Previos
- Node.js versión 18 o superior.
- Gestor de paquetes npm versión 9 o superior.

### Comandos de Ejecución

1. Instalación de dependencias:
   ```bash
   npm install
   ```

2. Compilación del proyecto:
   ```bash
   npm run build
   ```

3. Ejecución del entorno de producción:
   ```bash
   npm start
   ```

4. Verificación del estado operativo:
   ```bash
   curl http://localhost:3000/api/health
   ```

---

## Créditos y Propiedad Intelectual

- Autor: Diego David Guevara Flores
- Cliente: ALPHABIT
- Tiempo de Desarrollo: 2 semanas
- Licencia: Uso interno y exclusivo para la plataforma ALPHABIT
