# Panel de Administración - Tests de Oposiciones

Panel de administración desarrollado en Angular 18 para gestionar el sistema de tests de oposiciones. Incluye autenticación JWT, gestión de topics y subtemas, dashboard con estadísticas y perfil de usuario.

## 🎯 Características

- **Autenticación JWT**: Login seguro con tokens JWT
- **Dashboard**: Estadísticas generales del sistema
- **Gestión de Topics**: CRUD completo para temas y subtemas
- **Perfil de Usuario**: Gestión de información personal y cambio de contraseña
- **Tema Oscuro**: Interfaz con estilo dark y elementos con opacidad
- **Responsive Design**: Adaptable a móviles y tablets
- **Angular Material**: Componentes UI modernos y accesibles

## 🏗️ Arquitectura

```
src/
├── app/
│   ├── core/                    # Servicios globales y configuración
│   │   ├── guards/             # Guards de autenticación
│   │   ├── interceptors/       # Interceptores HTTP
│   │   ├── models/             # Modelos TypeScript
│   │   └── services/           # Servicios principales
│   ├── shared/                 # Componentes compartidos
│   │   └── components/         # Componentes reutilizables
│   ├── features/               # Módulos por funcionalidad
│   │   ├── auth/              # Autenticación
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── topics/            # Gestión de topics
│   │   └── user/              # Perfil de usuario
│   ├── app.routes.ts          # Configuración de rutas
│   └── app.config.ts          # Configuración de la aplicación
└── environments/               # Variables de entorno
```

## 🚀 Instalación y Desarrollo

### Prerrequisitos

- Node.js 18+ 
- npm 9+
- Angular CLI 18+

### Instalación

```bash
# Clonar el repositorio
cd admin-panel

# Instalar dependencias
npm install

# Servidor de desarrollo
ng serve

# Compilar para producción
ng build --configuration production
```

### Variables de Entorno

Configurar las variables en `src/environments/`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://tu-api-url.com/api/v1'
};
```

## 📱 Funcionalidades

### 🔐 Autenticación

- Login con email y contraseña
- Validación de formularios reactivos
- Guard de autenticación para rutas protegidas
- Interceptor JWT automático
- Gestión de sesión en localStorage

### 📊 Dashboard

- Estadísticas del usuario administrador
- Resumen de topics (total, habilitados, deshabilitados)
- Topics por área (PN/PS)
- Acciones rápidas
- Actividad reciente

### 📚 Gestión de Topics

- Listado con paginación y filtros
- Búsqueda por título
- Filtro por área (PN/PS)
- Filtro por estado (habilitado/deshabilitado)
- Toggle de estado habilitado/deshabilitado
- Vista detallada de topics
- Gestión de subtemas

### 👤 Perfil de Usuario

- Edición de información personal
- Cambio de contraseña
- Información de la cuenta
- Área asignada (PN/PS)

## 🎨 Diseño

### Tema Oscuro

- Colores personalizados con variables CSS
- Elementos con opacidad y backdrop-filter
- Transiciones suaves
- Efectos hover y focus

### Responsive Design

- Adaptable a móviles, tablets y desktop
- Sidebar colapsable
- Grids responsivos
- Componentes optimizados para touch

### Componentes Material

- Cards con efectos glassmorphism
- Tablas con paginación
- Formularios con validación
- Snackbars para notificaciones
- Dialogs para confirmaciones

## 🔧 Tecnologías

- **Angular 18**: Framework principal
- **Angular Material**: Componentes UI
- **RxJS**: Programación reactiva
- **TypeScript**: Tipado estático
- **SCSS**: Estilos con variables CSS
- **Standalone Components**: Arquitectura moderna

## 📡 API Integration

### Endpoints Utilizados

- `POST /auth/login` - Autenticación
- `GET /admin/user` - Información del usuario
- `PUT /admin/user` - Actualizar usuario
- `POST /admin/user/reset-password` - Cambiar contraseña
- `GET /admin/stats/user` - Estadísticas del usuario
- `GET /admin/stats/topics` - Estadísticas de topics
- `GET /admin/topics` - Listar topics
- `GET /admin/topics/:id` - Obtener topic
- `GET /admin/topics/:id/subtopics` - Obtener subtemas
- `PATCH /admin/topics/:id/enabled` - Toggle estado
- `PUT /admin/topics/:id` - Actualizar topic
- `DELETE /admin/topics/:id` - Eliminar topic

### Modelos de Datos

```typescript
// Usuario
interface IUser {
  id: string;
  name: string;
  email: string;
  appId: string;
  createdAt: string;
  updatedAt: string;
}

// Topic
interface Topic {
  id: string;
  uuid: string;
  rootId: string;
  rootUuid: string;
  area: string;
  title: string;
  description?: string;
  imageUrl?: string;
  enabled: boolean;
  order: string;
  parentUuid?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 🛡️ Seguridad

- Autenticación JWT con interceptores
- Validación de formularios
- Sanitización de datos
- Protección de rutas con guards
- Manejo seguro de errores

## 🚀 Deployment

### Build de Producción

```bash
ng build --configuration production
```

### Variables de Entorno de Producción

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-api-produccion.com/api/v1'
};
```

## 📝 Scripts Disponibles

```bash
# Desarrollo
ng serve

# Build
ng build

# Tests
ng test

# Linting
ng lint

# Análisis de bundle
ng build --stats-json
```

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:

- Crear un issue en el repositorio
- Contactar al equipo de desarrollo
- Revisar la documentación de la API

---

**Desarrollado con ❤️ para el sistema de tests de oposiciones**
