# 📝 Changelog - Campo `type` para Topics

## 🎯 Objetivo
Añadir un campo `type` a los topics para poder clasificarlos en diferentes categorías: **Temas**, **Exámenes Oficiales** y **Miscelánea**, permitiendo mostrarlos en secciones separadas del frontend.

## 📅 Fecha de Implementación
**11 de Octubre, 2025**

---

## 🔧 Cambios Realizados

### Backend (`opo_admin_server`)

#### 1. Modelo Actualizado: `internal/domain/models.go`

```go
type Topic struct {
    // ... campos existentes ...
    Type string `bson:"type" json:"type"` // Tipo: "topic", "exam", "misc"
}
```

**Tipos válidos:**
- `"topic"` → Temas normales (valor por defecto)
- `"exam"` → Exámenes oficiales
- `"misc"` → Miscelánea

---

#### 2. Handler de Creación: `AdminTopicsCreate`

**Validación añadida:**
```go
// Validar tipo si se proporciona, sino establecer valor por defecto
if req.Type == "" {
    req.Type = "topic" // Valor por defecto
} else {
    if req.Type != "topic" && req.Type != "exam" && req.Type != "misc" {
        writeError(w, http.StatusUnprocessableEntity, "validation_error", 
            "type debe ser 'topic', 'exam' o 'misc'")
        return
    }
}
```

**Características:**
- ✅ Asigna automáticamente `"topic"` si no se proporciona
- ✅ Valida que el tipo sea uno de los tres valores permitidos
- ✅ Log del tipo asignado al crear

---

#### 3. Handler de Actualización: `AdminTopicsUpdate`

**Validación añadida:**
```go
// Validar tipo si se proporciona
if req.Type != "" {
    if req.Type != "topic" && req.Type != "exam" && req.Type != "misc" {
        writeError(w, http.StatusUnprocessableEntity, "validation_error", 
            "type debe ser 'topic', 'exam' o 'misc'")
        return
    }
}

// Agregar tipo al update si se proporciona
if req.Type != "" {
    update["$set"].(bson.M)["type"] = req.Type
    log.Printf("🔄 AdminTopicsUpdate - Actualizando type del topic %d a %s", id, req.Type)
}
```

**Actualización en cascada mejorada:**
```go
// Si se cambió el área o el tipo y es un tema principal, actualizar todos los subtopics
if (req.Area != 0 || req.Type != "") && topic.IsMainTopic() {
    // Preparar actualización de subtopics
    subtopicsUpdateFields := bson.M{
        "updatedAt": time.Now(),
    }

    // Agregar área si se cambió
    if req.Area != 0 {
        subtopicsUpdateFields["area"] = req.Area
    }

    // Agregar tipo si se cambió
    if req.Type != "" {
        subtopicsUpdateFields["type"] = req.Type
    }

    // Actualizar todos los subtopics
    updateResult, _ := col.UpdateMany(ctx, subtopicsFilter, subtopicsUpdate)
}
```

**Características:**
- ✅ Valida el tipo si se proporciona
- ✅ Actualiza solo si hay cambio
- ✅ **Hereda el tipo a todos los subtopics** cuando se cambia el tipo de un tema principal
- ✅ Logs detallados de la actualización en cascada

---

#### 4. Handler de Listado: `AdminTopicsList`

**Filtro añadido:**
```go
// Agregar filtro de type si viene en los parámetros
typeParam := r.URL.Query().Get("type")
if typeParam != "" {
    // Validar que el type sea válido
    if typeParam == "topic" || typeParam == "exam" || typeParam == "misc" {
        filter["type"] = typeParam
        log.Printf("🔍 AdminTopicsList - Aplicando filtro type: %s", typeParam)
    } else {
        log.Printf("⚠️ AdminTopicsList - Type inválido ignorado: %s", typeParam)
    }
}
```

**Uso:**
```
GET /api/v1/admin/topics?area=1&type=exam
GET /api/v1/admin/topics?area=1&type=topic
GET /api/v1/admin/topics?area=1&type=misc
```

---

### Frontend (`opo_admin_panel`)

#### 1. Modelo Actualizado: `core/models/topic.model.ts`

```typescript
export interface Topic {
  // ... campos existentes ...
  type: 'topic' | 'exam' | 'misc'; // Tipo de topic
}
```

---

#### 2. Componente de Edición: `topic-edit.component.ts`

**Formulario actualizado:**
```typescript
private initForm(): void {
  this.editForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    order: [0, [Validators.required, Validators.min(0), Validators.max(9999)]],
    area: [1, [Validators.required, Validators.min(1), Validators.max(2)]],
    type: ['topic', [Validators.required]], // Nuevo campo
  });
}
```

**Carga de datos:**
```typescript
this.editForm.patchValue({
  title: topic.title,
  order: topic.order,
  area: topic.area,
  type: topic.type || 'topic', // Valor por defecto si no existe
});
```

**Envío de datos:**
```typescript
const updateData: Topic = {
  ...this.topic,
  title: this.editForm.value.title,
  order: this.editForm.value.order,
  area: this.editForm.value.area,
  type: this.editForm.value.type, // Incluir tipo
};
```

---

#### 3. Template: `topic-edit.component.html`

```html
<!-- Type Field -->
<mat-form-field appearance="outline" class="full-width">
    <mat-label>Tipo</mat-label>
    <mat-select formControlName="type" placeholder="Seleccione el tipo">
        <mat-icon matPrefix>category</mat-icon>
        <mat-option value="topic">
            <mat-icon>menu_book</mat-icon> Temas
        </mat-option>
        <mat-option value="exam">
            <mat-icon>description</mat-icon> Exámenes Oficiales
        </mat-option>
        <mat-option value="misc">
            <mat-icon>folder_special</mat-icon> Miscelánea
        </mat-option>
    </mat-select>
    <mat-icon matPrefix>category</mat-icon>
    <mat-hint>Seleccione el tipo de topic (heredado a subtopics)</mat-hint>
    <mat-error *ngIf="type?.hasError('required')"> El tipo es requerido </mat-error>
</mat-form-field>
```

**Características:**
- ✅ Selector visual con iconos
- ✅ Hint informativo sobre herencia a subtopics
- ✅ Validación requerida
- ✅ Iconos descriptivos para cada tipo

---

### Scripts de Migración

#### Archivo: `scripts/add-type-field.js`

Script Node.js para añadir el campo `type` a todos los topics existentes.

**Funcionalidad:**
- ✅ Detecta topics sin el campo `type`
- ✅ Asigna `type: "topic"` por defecto
- ✅ Muestra estadísticas antes y después
- ✅ Logs detallados del proceso

**Ejecución:**
```bash
# Linux/Mac
./scripts/add-type-field.sh

# Windows
scripts\add-type-field.bat

# O manualmente
node scripts/add-type-field.js
```

**Salida esperada:**
```
✅ Conectado a MongoDB
📊 Topics sin campo 'type': 42

✅ Operación completada:
   - Documentos encontrados: 42
   - Documentos actualizados: 42

📊 Estadísticas finales:
   - Total de topics: 42
   - Topics tipo 'topic': 42
   - Topics tipo 'exam': 0
   - Topics tipo 'misc': 0
```

---

## 🔀 Herencia del Tipo en Cascada

### Funcionalidad

Cuando se cambia el tipo de un **tema principal** (donde `id === rootId`), el sistema automáticamente:

1. **Detecta** que es un tema principal
2. **Busca** todos los subtopics con `rootId` igual al id del tema principal
3. **Actualiza** el tipo de todos los subtopics encontrados
4. **Registra** en los logs la cantidad de subtopics actualizados

### Ejemplo

**Escenario:**
- Tema Principal: "Exámenes 2024" (ID: 500, Type: "topic")
  - Subtopic: "Enero 2024" (ID: 501, rootId: 500, Type: "topic")
  - Subtopic: "Febrero 2024" (ID: 502, rootId: 500, Type: "topic")

**Acción:** Cambiar el tipo del tema principal de `"topic"` a `"exam"`

**Resultado:**
```
🔄 AdminTopicsUpdate - Actualizando type del topic 500 a exam
🔍 AdminTopicsUpdate - Es un tema principal, buscando subtopics con rootId=500
📊 AdminTopicsUpdate - Encontrados 2 subtopics para actualizar
✅ AdminTopicsUpdate - 2 subtopics actualizados al type exam
✅ AdminTopicsUpdate - Topic 500 actualizado exitosamente
```

**Base de datos:**
- ✅ Tema Principal → Type: "exam"
- ✅ Subtopic "Enero 2024" → Type: "exam"
- ✅ Subtopic "Febrero 2024" → Type: "exam"

---

## 📊 Uso del Filtro por Tipo

### Endpoints

```
GET /api/v1/admin/topics?area=1&type=topic    # Listar solo temas normales
GET /api/v1/admin/topics?area=1&type=exam     # Listar solo exámenes oficiales
GET /api/v1/admin/topics?area=1&type=misc     # Listar solo miscelánea
```

### Frontend - Uso Futuro

```typescript
// En el servicio
getTopicsByType(area: number, type: 'topic' | 'exam' | 'misc'): Observable<TopicResponse> {
  return this.getTopics({ area, type });
}

// En componentes
// Listado de temas normales
this.topicService.getTopicsByType(1, 'topic').subscribe(...);

// Listado de exámenes oficiales
this.topicService.getTopicsByType(1, 'exam').subscribe(...);

// Listado de miscelánea
this.topicService.getTopicsByType(1, 'misc').subscribe(...);
```

---

## 🎨 UI Propuesta para Diferentes Secciones

```
📚 Panel de Administración - Área: Policía Nacional

┌─────────────────────────────────┐
│ 🏠 Dashboard                    │
│                                 │
│ 📖 Temas                        │  ← GET /topics?area=1&type=topic
│ 📝 Exámenes Oficiales          │  ← GET /topics?area=1&type=exam
│ 📚 Miscelánea                   │  ← GET /topics?area=1&type=misc
└─────────────────────────────────┘
```

---

## 🧪 Pruebas Recomendadas

### Backend

1. **Crear topic sin especificar type**
   - Verificar que se asigna `"topic"` por defecto
   
2. **Crear topic con type válido**
   - Probar con `"topic"`, `"exam"` y `"misc"`
   
3. **Intentar crear topic con type inválido**
   - Verificar que retorna error 422
   
4. **Actualizar type de tema principal**
   - Verificar que los subtopics heredan el nuevo tipo
   
5. **Filtrar topics por type**
   - Verificar que solo retorna topics del tipo especificado

### Frontend

1. **Editar topic y cambiar tipo**
   - Verificar que el selector muestra las 3 opciones
   - Verificar que se guarda correctamente
   
2. **Crear topic nuevo**
   - Verificar que tiene tipo por defecto "Temas"
   
3. **Ver herencia de tipo**
   - Cambiar tipo de tema principal
   - Verificar que subtopics también cambiaron

### Migración

1. **Ejecutar script de migración**
   - Verificar que todos los topics tienen campo `type`
   - Verificar estadísticas finales

---

## ⚠️ Consideraciones Importantes

1. **Valor por defecto**: Todos los topics nuevos y existentes (después de la migración) tendrán `type: "topic"` por defecto

2. **Herencia en cascada**: Los subtopics heredan automáticamente el tipo del tema principal cuando se cambia

3. **Validación estricta**: Solo se aceptan los valores `"topic"`, `"exam"` o `"misc"`

4. **Retrocompatibilidad**: El frontend maneja topics sin tipo asignándoles `"topic"` por defecto

5. **Filtrado opcional**: El parámetro `type` es opcional en el listado, si no se proporciona muestra todos los tipos

---

## 🚀 Próximos Pasos

1. **Crear componentes separados en el frontend**
   - `TopicListComponent` para temas normales
   - `ExamListComponent` para exámenes oficiales
   - `MiscListComponent` para miscelánea

2. **Actualizar navegación**
   - Añadir enlaces en el menú para cada sección
   - Actualizar rutas de Angular

3. **Iconos y visualización**
   - Mostrar iconos diferentes según el tipo
   - Badges visuales para identificar el tipo

4. **Estadísticas**
   - Incluir count por tipo en el dashboard
   - Gráficos de distribución de topics por tipo

---

## ✅ Estado
**COMPLETADO** - Funcionalidad lista para pruebas y uso en producción.

### ✨ Características Implementadas
- ✅ Campo `type` añadido al modelo Topic
- ✅ Validación de tipos permitidos (backend)
- ✅ Selector visual de tipo (frontend)
- ✅ Herencia automática de tipo a subtopics
- ✅ Filtro por tipo en listados
- ✅ Script de migración para topics existentes
- ✅ Logs detallados para debugging
- ✅ Documentación completa

### 📊 Tipos Disponibles
| Valor | Etiqueta | Icono | Uso |
|-------|----------|-------|-----|
| `topic` | Temas | 📖 `menu_book` | Temas normales de estudio |
| `exam` | Exámenes Oficiales | 📝 `description` | Exámenes oficiales convocatorias |
| `misc` | Miscelánea | 📚 `folder_special` | Material complementario, extras |

---

## 📝 Resumen Técnico

- **Backend**: 4 archivos modificados
  - `internal/domain/models.go`
  - `internal/http/admin_handlers.go` (3 handlers actualizados)
- **Frontend**: 2 archivos modificados
  - `core/models/topic.model.ts`
  - `features/topics/pages/topic-edit/` (component + template)
- **Scripts**: 3 archivos creados
  - `scripts/add-type-field.js`
  - `scripts/add-type-field.bat`
  - `scripts/add-type-field.sh`

