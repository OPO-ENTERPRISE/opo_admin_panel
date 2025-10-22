# 🚀 Guía de Inicio Rápido - Sistema de Coins

## ⏱️ 5 Minutos para Producción

### Paso 1: Instalar Plugin AdMob (2 min)

**Windows:**
```bash
cd opo_movil
install-admob.bat
```

**Linux/Mac:**
```bash
cd opo_movil
chmod +x install-admob.sh
./install-admob.sh
```

O manualmente:
```bash
cd opo_movil
npm install @capacitor-community/admob
npx cap sync
```

---

### Paso 2: Configurar Android (1 min)

Editar: `opo_movil/android/app/src/main/AndroidManifest.xml`

Agregar dentro de `<application>`:
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-8093764362318910/9176629045"/>
```

---

### Paso 3: Migrar Base de Datos (1 min)

```bash
cd opo_movil_server

# Configurar variables de entorno si no están
export MONGODB_URI="mongodb://..."
export DB_NAME="opo_movil"

# Ejecutar migración
node scripts/add-coins-to-users.js
```

Deberías ver:
```
✅ Actualización completada:
   - Usuarios encontrados: X
   - Usuarios modificados: X
```

---

### Paso 4: Inicializar AdMob en la App (1 min)

El código ya está implementado, pero verifica que AdMob se inicialice al arrancar la app.

**Opción A: En `app.component.ts` (recomendado)**

```typescript
import { AdMobService } from './core/services/admob.service';

export class AppComponent implements OnInit {
  constructor(private admobService: AdMobService) {}
  
  async ngOnInit() {
    await this.admobService.initializeAdMob();
  }
}
```

**Opción B: En `app-init.service.ts` (si existe)**

```typescript
import { AdMobService } from './core/services/admob.service';

export class AppInitService {
  constructor(private admobService: AdMobService) {}
  
  async init() {
    await this.admobService.initializeAdMob();
    // ... otras inicializaciones
  }
}
```

---

### Paso 5: Probar (< 1 min)

**Desarrollo (navegador):**
```bash
cd opo_movil
ionic serve
```

- Completa un test
- Navega a resultados
- Verás simulación de video (5 seg)
- ✅ Coins se suman correctamente

**Dispositivo real:**
```bash
cd opo_movil
ionic build
npx cap copy
npx cap open android
```

- Build en Android Studio
- Instala en dispositivo
- Completa un test
- Navega a resultados
- ✅ Video real de AdMob se muestra

---

## ✅ Verificación

### Backend
```bash
# Test endpoint de balance
curl -X GET https://tu-api.com/api/v1/users/me/coins \
  -H "Authorization: Bearer YOUR_TOKEN"

# Deberías ver:
# {"coins": 0}
```

### Frontend
1. Login en la app
2. Mira el toolbar superior derecho
3. ✅ Deberías ver un chip con icono de moneda y "0"

### Flujo Completo
1. Login → Ver "0 coins" en toolbar
2. Completar test → Navegar a resultados
3. Modal: "¿Ver video para ganar 50 coins?"
4. Ver video completo
5. ✅ Ver "50 coins" en toolbar
6. Completar otro test → Navegar a resultados
7. ✅ Acceso directo (gasta 50 coins automáticamente)
8. Ver "0 coins" en toolbar

---

## 🐛 Troubleshooting Rápido

### Error: "Plugin AdMob no está instalado"
```bash
cd opo_movil
npm install @capacitor-community/admob
npx cap sync
```

### Error: "Usuario no autenticado" (401)
- Verifica que el token JWT sea válido
- Verifica que el header Authorization esté presente

### Coins no se actualizan en UI
- Verifica en Network tab que la llamada a `/users/me/coins` sea exitosa
- Revisa la consola del navegador/dispositivo

### Video no se muestra
- En desarrollo web: debería simular (5 seg de espera)
- En dispositivo: verifica conexión a internet
- Verifica que AdMob App ID sea correcto en AndroidManifest

### Backend no responde
```bash
cd opo_movil_server
# Verifica que el servidor esté corriendo
go run cmd/api/main.go
```

---

## 📚 Documentación Completa

Para más detalles:

1. **Sistema completo:** `opo_movil/COINS_SYSTEM_README.md`
2. **API Backend:** `opo_movil_server/COINS_API_DOCUMENTATION.md`
3. **Resumen ejecutivo:** `SISTEMA_COINS_RESUMEN.md`

---

## 🎯 Configuración Actual

| Configuración | Valor |
|---------------|-------|
| Costo ver resultados | 50 coins |
| Recompensa por video | 50 coins |
| Coins iniciales | 0 |
| AdMob App ID | `ca-app-pub-8093764362318910/9176629045` |

Para cambiar estos valores:
- Frontend: `src/app/core/constants/coins.constants.ts`

---

## 💡 Consejos

1. **Testing en desarrollo:** Usa `ionic serve` - los videos se simulan
2. **Testing de producción:** Usa dispositivo real para probar AdMob
3. **Migración de BD:** Ejecuta solo una vez
4. **Logs:** Revisa consola para ver operaciones de coins con emojis (💰, 💸, 🎬)

---

## ✨ ¡Listo!

El sistema de coins está funcionando. Ahora los usuarios:
- 🎬 Ven videos para ganar coins
- 💰 Acumulan coins para uso futuro
- 🚀 Disfrutan de una mejor experiencia

**Tiempo total: ~5 minutos** ⏱️

