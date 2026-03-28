# Review Intel — Amazon FBA Competitor Analysis Tool

## Stack
- **Frontend**: HTML/CSS/JS estático (GitHub Pages)
- **Backend**: Vercel Serverless Functions
- **Data**: DataForSEO API (Amazon search)
- **AI**: Claude API (review analysis)

---

## Deploy paso a paso

### 1. Sube el proyecto a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/review-intel.git
git push -u origin main
```

### 2. Importa en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. New Project → Import Git Repository → selecciona `review-intel`
3. Framework Preset: **Other**
4. Root Directory: `.` (raíz)
5. Click **Deploy**

### 3. Configura las variables de entorno en Vercel

En tu proyecto Vercel → Settings → Environment Variables, añade:

| Variable | Valor |
|---|---|
| `DATAFORSEO_LOGIN` | Tu email de DataForSEO |
| `DATAFORSEO_PASSWORD` | Tu API password de DataForSEO |
| `ANTHROPIC_API_KEY` | Tu API key de Claude (platform.anthropic.com) |

### 4. Actualiza la URL en el frontend

En `public/index.html`, línea ~320, cambia:

```js
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://TU-PROYECTO.vercel.app'; // ← PON AQUÍ TU URL DE VERCEL
```

Commit y push → Vercel redespliega automáticamente.

### 5. (Opcional) GitHub Pages para el frontend

Si quieres servir el frontend desde GitHub Pages:
- Settings → Pages → Source: `main` branch → `/public` folder

---

## Cómo usar la app

1. Introduce keyword (ej: "alcachofa de ducha")
2. Selecciona marketplace (España, Alemania, etc.)
3. La app busca automáticamente los top competidores
4. Haz clic en "Ver reviews en Amazon" en cualquier competidor
5. Copia las reviews desde Amazon y pégalas en la app
6. La IA analiza y entrega: problemas, positivos, patrones, scores y acciones

---

## Costes estimados

| Servicio | Coste |
|---|---|
| Vercel | Gratis |
| GitHub Pages | Gratis |
| DataForSEO search | ~$0.001 por búsqueda |
| Claude API (análisis) | ~$0.002 por análisis |
| **Total por uso completo** | **~$0.003** |
