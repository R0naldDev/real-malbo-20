# Real Malbo 20 — EA FC Pro Clubs Dashboard

## ⚠️ IMPORTANTE: Estructura de archivos

Los archivos DEBEN estar en la RAÍZ del repositorio de GitHub, así:

```
tu-repositorio/          ← RAÍZ
├── api/
│   └── ea-proxy.js      ← Proxy serverless
├── public/
│   └── index.html       ← Tu página web
├── vercel.json
├── package.json
└── README.md
```

❌ NO así (dentro de una carpeta):
```
tu-repositorio/
└── real-malbo-20/       ← ESTO ESTÁ MAL
    ├── api/
    └── public/
```

---

## 🚀 Pasos para desplegar (CORREGIDO)

### Paso 1: Actualizar tu repositorio en GitHub

1. Ve a tu repositorio: https://github.com/TU_USUARIO/real-malbo-20
2. **BORRA todos los archivos actuales** (haz clic en cada uno → botón "..." → Delete)
3. O más fácil: borra el repositorio completo y crea uno nuevo

### Paso 2: Subir los archivos correctamente

1. En tu repositorio vacío, haz clic en **"Add file"** → **"Upload files"**
2. **DESCOMPRIME el ZIP primero** en tu computadora
3. Abre la carpeta descomprimida
4. Arrastra estos archivos/carpetas directamente:
   - 📁 `api/` (la carpeta completa)
   - 📁 `public/` (la carpeta completa)
   - 📄 `vercel.json`
   - 📄 `package.json`
5. Haz clic en **"Commit changes"**

### Paso 3: Re-desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com) → tu dashboard
2. Si ya tienes el proyecto anterior, haz clic en él → **Settings** → **General** → scroll abajo → **Delete Project**
3. Ve a [vercel.com/new](https://vercel.com/new) → importa tu repositorio
4. Framework Preset: **Other**
5. Root Directory: **déjalo vacío** (muy importante)
6. Haz clic en **Deploy**

### Paso 4: Verificar

1. Cuando termine el deploy, abre tu URL (ej: `real-malbo-20.vercel.app`)
2. Abre también: `real-malbo-20.vercel.app/api/ea-proxy?endpoint=clubs/info&clubIds=483418&platform=common-gen5`
3. Si el paso 2 muestra datos JSON, ¡todo funciona!

---

## 🔧 Cómo funciona

```
Tu navegador
    ↓ pide datos
tu-app.vercel.app/api/ea-proxy?endpoint=clubs/info&clubIds=483418
    ↓ Vercel serverless function
proclubs.ea.com/api/fc/clubs/info?clubIds=483418
    ↓ EA responde con datos JSON
Tu navegador recibe los datos (sin problemas de CORS)
```
