# 📝 Changelog - Módulo de Proveedores de Publicidad

## 🎯 Objetivo
Permitir la gestión dinámica de proveedores de publicidad mediante un CRUD completo, eliminando los valores hardcodeados y permitiendo añadir, editar y eliminar proveedores desde el panel de administración.

## 📅 Fecha de Implementación
**11 de Octubre, 2025**

---

## 📊 Modelo de Proveedor

### Campos Implementados

| Campo | Tipo | Descripción | Obligatorio | Ejemplo |
|-------|------|-------------|-------------|---------|
| `_id` | string | ID de MongoDB | Automático | `"uuid-xxx"` |
| `providerId` | string | Slug único del proveedor | ✅ Sí | `"admob"`, `"facebook"` |
| `name` | string | Nombre visible | ✅ Sí | `"AdMob"`, `"Facebook Audience"` |
| `icon` | string | Icono de Material Icons | ❌ No | `"ads_click"`, `"campaign"` |
| `color` | string | Color hex para badges | ❌ No | `"#4285f4"`, `"#1877f2"` |
| `enabled` | boolean | Estado activo/inactivo | ✅ Sí | `true`, `false` |
| `order` | number | Orden de visualización | ✅ Sí | `1`, `2`, `3...` |
| `createdAt` | string | Fecha de creación | Automático | ISO 8601 |
| `updatedAt` | string | Fecha de actualización | Automático | ISO 8601 |

---

## 🔧 Backend (`opo_admin_server`)

### 1. Modelo: `internal/domain/models.go`

```go
type AdProvider struct {
    ID         string    `bson:"_id" json:"_id"`
    ProviderID string    `bson:"providerId" json:"providerId"` // Slug único
    Name       string    `bson:"name" json:"name"`
    Icon       string    `bson:"icon,omitempty" json:"icon,omitempty"`
    Color      string    `bson:"color,omitempty" json:"color,omitempty"`
    Enabled    bool      `bson:"enabled" json:"enabled"`
    Order      int       `bson:"order" json:"order"`
    CreatedAt  time.Time `bson:"createdAt" json:"createdAt"`
    UpdatedAt  time.Time `bson:"updatedAt" json:"updatedAt"`
}
```

### 2. Handlers CRUD: `internal/http/admin_handlers.go`

#### Handlers Implementados

| Handler | Método | Endpoint | Descripción |
|---------|--------|----------|-------------|
| `AdminProvidersList` | GET | `/admin/providers` | Listar con paginación |
| `AdminProvidersGetByID` | GET | `/admin/providers/{id}` | Obtener por ID |
| `AdminProvidersCreate` | POST | `/admin/providers` | Crear nuevo |
| `AdminProvidersUpdate` | PUT | `/admin/providers/{id}` | Actualizar |
| `AdminProvidersToggleEnabled` | PATCH | `/admin/providers/{id}/enabled` | Toggle estado |
| `AdminProvidersDelete` | DELETE | `/admin/providers/{id}` | Eliminar |

#### Validaciones

**Creación:**
- ✅ `name` requerido (3-100 caracteres)
- ✅ `providerId` requerido (slug único, lowercase)
- ✅ Verifica que no exista otro proveedor con el mismo `providerId`
- ✅ Genera UUID automático para `_id`
- ✅ Asigna timestamps automáticos

**Actualización:**
- ✅ No permite cambiar `providerId` (identificador inmutable)
- ✅ Valida longitud del `name` si se proporciona
- ✅ Actualiza solo campos proporcionados

### 3. Rutas: `internal/http/router.go`

```go
// Administración de proveedores de publicidad
r.Get("/providers", AdminProvidersList(cfg))
r.Get("/providers/{id}", AdminProvidersGetByID(cfg))
r.Post("/providers", AdminProvidersCreate(cfg))
r.Put("/providers/{id}", AdminProvidersUpdate(cfg))
r.Patch("/providers/{id}/enabled", AdminProvidersToggleEnabled(cfg))
r.Delete("/providers/{id}", AdminProvidersDelete(cfg))
```

### 4. Script de Inicialización: `scripts/init-providers.js`

**Ejecución:**
```bash
# Windows
scripts\init-providers.bat

# Linux/Mac
./scripts/init-providers.sh

# Manual
node scripts/init-providers.js
```

**Proveedores Iniciales:**
1. **AdMob** (Google)
   - ID: `admob`
   - Icon: `ads_click`
   - Color: `#4285f4` (azul Google)
   
2. **Facebook Audience Network**
   - ID: `facebook`
   - Icon: `campaign`
   - Color: `#1877f2` (azul Facebook)
   
3. **Unity Ads**
   - ID: `unity`
   - Icon: `videogame_asset`
   - Color: `#000000` (negro Unity)
   
4. **Personalizado**
   - ID: `custom`
   - Icon: `settings`
   - Color: `#757575` (gris)

---

## 🎨 Frontend (`opo_admin_panel`)

### 1. Modelo: `core/models/provider.model.ts`

```typescript
export interface AdProvider {
  _id?: string;
  providerId: string;
  name: string;
  icon?: string;
  color?: string;
  enabled: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}
```

### 2. Servicio: `core/services/provider.service.ts`

**Métodos Implementados:**
- `getProviders(filters)` - Listar con filtros
- `getProviderById(id)` - Obtener por ID
- `createProvider(data)` - Crear
- `updateProvider(id, data)` - Actualizar
- `toggleProviderStatus(id, enabled)` - Toggle estado
- `deleteProvider(id)` - Eliminar
- `getEnabledProviders()` - Solo habilitados (para selectores)

### 3. Componente Listado: `features/ads/pages/provider-list/`

**Características:**
- ✅ Tabla con Angular Material
- ✅ Columnas: Nombre, ID, Icono, Color, Estado, Orden, Acciones
- ✅ Preview visual del icono y color
- ✅ Toggle enabled/disabled con un click
- ✅ Edición y eliminación
- ✅ Loading spinner
- ✅ Empty state
- ✅ Responsive

**Vista de Tabla:**
```
┌────────────────┬──────────┬───────┬─────────┬──────────┬───────┬─────────┐
│ Nombre         │ ID       │ Icono │ Color   │ Estado   │ Orden │ Acciones│
├────────────────┼──────────┼───────┼─────────┼──────────┼───────┼─────────┤
│ 📢 AdMob       │ admob    │ 📢    │ 🔵 #42  │ ✅ Hab.  │  1    │ ✏️🔄🗑️ │
│ 📢 Facebook    │ facebook │ 📢    │ 🔵 #18  │ ✅ Hab.  │  2    │ ✏️🔄🗑️ │
│ 🎮 Unity       │ unity    │ 🎮    │ ⚫ #00  │ ✅ Hab.  │  3    │ ✏️🔄🗑️ │
│ ⚙️ Custom      │ custom   │ ⚙️    │ ⚪ #75  │ ✅ Hab.  │ 99    │ ✏️🔄🗑️ │
└────────────────┴──────────┴───────┴─────────┴──────────┴───────┴─────────┘
```

### 4. Componente Formulario: `features/ads/pages/provider-form/`

**Campos del Formulario:**
- ✅ ID del Proveedor (slug) - Solo en creación
- ✅ Nombre del Proveedor
- ✅ Icono (Material Icon)
- ✅ Color (color picker)
- ✅ Orden (número)
- ✅ Estado (slide toggle)
- ✅ Vista previa en tiempo real

**Validaciones:**
- ID: required, minLength(2), maxLength(50)
- Nombre: required, minLength(3), maxLength(100)
- Orden: required, min(0), max(999)

**Características:**
- ✅ Modo creación y edición automático
- ✅ ID bloqueado en modo edición
- ✅ Preview del chip con icono y color
- ✅ Responsive

### 5. Menú Desplegable: `shared/components/main-layout/`

**Estructura del Menú:**
```
📊 Dashboard
📖 Topics
📂 Áreas
📢 Publicidad ▼
   ├─ 📝 Anuncios
   └─ 🏪 Proveedores
👥 Usuarios
👤 Perfil
🐛 Test CORS
```

**Implementación:**
- ✅ `MatExpansionModule` para submenús
- ✅ Propiedad `children` en `NavigationItem`
- ✅ Renderizado condicional (con/sin children)
- ✅ Estilos personalizados para expansion panel
- ✅ Indentación visual de items hijos

### 6. Rutas: `app.routes.ts`

```typescript
// Rutas de proveedores
/ads/providers           → ProviderListComponent
/ads/providers/new       → ProviderFormComponent (crear)
/ads/providers/:id/edit  → ProviderFormComponent (editar)
```

### 7. Integración en Anuncios: `ads-form.component.ts`

**Carga Dinámica de Proveedores:**
```typescript
private loadProviders(): void {
  this.providerService.getEnabledProviders().subscribe({
    next: (response) => {
      this.providerOptions = response.items.map(provider => ({
        value: provider.providerId,
        label: provider.name,
        icon: provider.icon,
        color: provider.color
      }));
    },
    error: () => {
      // Fallback a proveedores por defecto
    }
  });
}
```

**Beneficios:**
- ✅ Selector carga proveedores desde base de datos
- ✅ Solo muestra proveedores habilitados
- ✅ Fallback si falla la carga
- ✅ Actualización automática al crear nuevos proveedores

---

## 🔄 Flujo de Trabajo

### Crear Nuevo Proveedor

1. Usuario navega a **Publicidad > Proveedores**
2. Click en **"Nuevo Proveedor"**
3. Completa formulario:
   - ID: `"appodeal"`
   - Nombre: `"Appodeal"`
   - Icono: `"monetization_on"`
   - Color: `"#00BCD4"`
   - Orden: `4`
   - Estado: Habilitado
4. Guarda
5. Backend valida y crea en colección `ad_providers`
6. Usuario es redirigido a listado
7. Nuevo proveedor aparece automáticamente en selector de anuncios

### Editar Proveedor

1. En listado de proveedores, click en ✏️ Editar
2. Formulario carga datos actuales
3. Usuario modifica campos (excepto ID que está bloqueado)
4. Guarda
5. Backend actualiza
6. Cambios se reflejan en selector de anuncios

### Deshabilitar Proveedor

1. En listado, click en toggle 🔄
2. Proveedor se deshabilita
3. Ya no aparece en selector de anuncios (solo habilitados)
4. Anuncios existentes de ese proveedor no se afectan

---

## 📋 Endpoints de la API

### Colección: `ad_providers`

```json
{
  "_id": "uuid",
  "providerId": "admob",
  "name": "AdMob",
  "icon": "ads_click",
  "color": "#4285f4",
  "enabled": true,
  "order": 1,
  "createdAt": "2025-10-11T...",
  "updatedAt": "2025-10-11T..."
}
```

### Endpoints Disponibles

```
GET    /api/v1/admin/providers              # Listar (paginado)
GET    /api/v1/admin/providers/{id}         # Obtener por ID
POST   /api/v1/admin/providers              # Crear
PUT    /api/v1/admin/providers/{id}         # Actualizar
PATCH  /api/v1/admin/providers/{id}/enabled # Toggle enabled
DELETE /api/v1/admin/providers/{id}         # Eliminar
```

**Filtros disponibles:**
```
GET /api/v1/admin/providers?page=1&limit=20&enabled=true
```

---

## 🧪 Pruebas Recomendadas

### Backend

1. **Ejecutar script de inicialización**
   ```bash
   cd opo_admin_server
   node scripts/init-providers.js
   ```

2. **Listar proveedores**
   ```bash
   curl -H "Authorization: Bearer TOKEN" \
     http://localhost:8080/api/v1/admin/providers
   ```

3. **Crear proveedor**
   ```bash
   curl -X POST -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"providerId":"unity","name":"Unity Ads","enabled":true,"order":3}' \
     http://localhost:8080/api/v1/admin/providers
   ```

### Frontend

1. **Navegar a proveedores**
   - Menú lateral → Publicidad (expandir) → Proveedores
   - Verificar que muestra listado

2. **Crear proveedor**
   - Click "Nuevo Proveedor"
   - Llenar formulario
   - Ver preview en tiempo real
   - Guardar

3. **Editar proveedor**
   - Click ✏️ en un proveedor
   - Verificar que ID está bloqueado
   - Modificar nombre, icono, color
   - Guardar

4. **Toggle enabled**
   - Click 🔄 para deshabilitar
   - Verificar chip cambia de verde a rojo
   - Ir a formulario de anuncios
   - Verificar que proveedor deshabilitado NO aparece

5. **Eliminar proveedor**
   - Click 🗑️ en proveedor
   - Confirmar eliminación
   - Verificar que desaparece del listado

6. **Integración con anuncios**
   - Crear nuevo proveedor "Appodeal"
   - Ir a "Publicidad > Anuncios > Nuevo Anuncio"
   - Verificar que "Appodeal" aparece en selector de proveedor

---

## 🎨 UI Implementada

### Menú Lateral Desplegable

```
📊 Dashboard
📖 Topics
📂 Áreas
📢 Publicidad ▼              ← Click para expandir
   ├─ 📝 Anuncios
   └─ 🏪 Proveedores         ← Nueva sección
👥 Usuarios
👤 Perfil
```

### Listado de Proveedores

```
┌─────────────────────────────────────────────────────────┐
│ 🏪 Gestión de Proveedores          [+ Nuevo Proveedor] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Nombre           ID        Icono  Color  Estado  Orden │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 📢 AdMob         admob     📢     🔵    ✅ Hab.   1    │
│ 📢 Facebook      facebook  📢     🔵    ✅ Hab.   2    │
│ 🎮 Unity Ads     unity     🎮     ⚫    ✅ Hab.   3    │
│ ⚙️  Custom       custom    ⚙️     ⚪    ✅ Hab.  99    │
└─────────────────────────────────────────────────────────┘
```

### Formulario de Proveedor

```
┌──────────────────────────────────────────┐
│ ← 🏪 Crear Nuevo Proveedor               │
├──────────────────────────────────────────┤
│ ID del Proveedor: [appodeal_______]     │
│ Nombre:          [Appodeal__________]    │
│ Icono:           [📢] [monetization_on]  │
│ Color:           [🎨] [#00BCD4]         │
│ Orden:           [4___]                  │
│ Estado:          [✓] Habilitado          │
│                                          │
│ Vista Previa:                            │
│ ┌────────────────┐                       │
│ │ 📢 Appodeal   │                       │
│ └────────────────┘                       │
│                                          │
│ [Cancelar]  [Guardar]                    │
└──────────────────────────────────────────┘
```

---

## 🚀 Funcionalidades Implementadas

### Backend
- ✅ Modelo AdProvider completo
- ✅ 6 handlers CRUD
- ✅ Validaciones robustas
- ✅ Logging detallado
- ✅ Paginación y filtros
- ✅ Script de inicialización
- ✅ Colección `ad_providers` en MongoDB

### Frontend
- ✅ Modelo TypeScript tipado
- ✅ Servicio HTTP completo
- ✅ Componente de listado con tabla
- ✅ Componente de formulario create/edit
- ✅ Menú lateral con submenús desplegables
- ✅ Rutas configuradas
- ✅ Integración con formulario de anuncios
- ✅ Carga dinámica en selector
- ✅ Fallback si falla carga
- ✅ Estilos responsivos

---

## 📊 Archivos Creados/Modificados

### Backend (opo_admin_server)
- ✅ `internal/domain/models.go` - Modelo AdProvider
- ✅ `internal/http/admin_handlers.go` - 6 handlers nuevos
- ✅ `internal/http/router.go` - 6 rutas nuevas
- ✅ `scripts/init-providers.js` - Script de inicialización
- ✅ `scripts/init-providers.bat` - Wrapper Windows
- ✅ `scripts/init-providers.sh` - Wrapper Linux/Mac

### Frontend (opo_admin_panel)
- ✅ `core/models/provider.model.ts` - Modelo e interfaces
- ✅ `core/services/provider.service.ts` - Servicio HTTP
- ✅ `features/ads/pages/provider-list/` - Componente listado (3 archivos)
- ✅ `features/ads/pages/provider-form/` - Componente formulario (3 archivos)
- ✅ `shared/components/main-layout/main-layout.component.ts` - Menú desplegable
- ✅ `shared/components/main-layout/main-layout.component.html` - Template menú
- ✅ `shared/components/main-layout/main-layout.component.scss` - Estilos submenú
- ✅ `features/ads/pages/ads-form/ads-form.component.ts` - Carga dinámica
- ✅ `app.routes.ts` - 3 rutas nuevas

**Total:** 18 archivos (6 backend, 12 frontend)

---

## ✨ Características Clave

### 🔧 Gestión Completa
- ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ Toggle enabled/disabled
- ✅ Ordenamiento personalizable
- ✅ Validaciones en backend y frontend

### 🎨 Visualización
- ✅ Iconos personalizables de Material Icons
- ✅ Colores personalizables (hex)
- ✅ Preview en tiempo real en formulario
- ✅ Badges de colores en tabla

### 🔗 Integración
- ✅ Selector de anuncios carga proveedores desde BD
- ✅ Solo muestra proveedores habilitados
- ✅ Fallback a valores por defecto si falla

### 🎯 UX/UI
- ✅ Menú desplegable intuitivo
- ✅ Navegación clara (Anuncios/Proveedores)
- ✅ Formularios con validaciones inline
- ✅ Loading states en todas las operaciones
- ✅ Notificaciones (snackbar) de éxito/error
- ✅ Confirmación para eliminar

---

## 🚀 Próximos Pasos

### 1. Inicializar Proveedores

```bash
cd opo_admin_server
node scripts/init-providers.js
```

### 2. Reiniciar Backend

```bash
# Recompila y reinicia para cargar nuevas rutas
go run cmd/admin/main.go
```

### 3. Verificar Frontend

1. Login en panel de administración
2. Ir a Publicidad → Proveedores
3. Verificar que aparecen los 4 proveedores iniciales
4. Crear un proveedor nuevo
5. Ir a Publicidad → Anuncios → Nuevo Anuncio
6. Verificar que el nuevo proveedor aparece en el selector

---

## ⚠️ Consideraciones

1. **providerId único**: El sistema valida que no existan dos proveedores con el mismo `providerId`

2. **providerId inmutable**: Una vez creado, el `providerId` no se puede cambiar (para mantener integridad con anuncios existentes)

3. **Proveedores habilitados**: Solo aparecen en selectores los proveedores con `enabled: true`

4. **Orden personalizable**: Define el orden de aparición en selectores y listados

5. **Fallback**: Si falla la carga de proveedores, el selector muestra valores por defecto (AdMob, Facebook, Custom)

---

## ✅ Estado
**COMPLETADO** - Módulo completo implementado y listo para uso en producción.

### ✨ Funcionalidades Implementadas
- ✅ Backend: Modelo + 6 handlers + rutas
- ✅ Frontend: Modelos + servicio + 2 componentes
- ✅ Menú desplegable con navegación
- ✅ Integración con formulario de anuncios
- ✅ Scripts de inicialización
- ✅ Sin errores de linter
- ✅ Documentación completa

