# Listing Intel — Amazon FBA

## Estructura
```
listing-intel/
├── api/
│   ├── get-asin.js         → Obtiene datos del ASIN via Rainforest API
│   └── analyze-listing.js  → Analiza listing con IA (gpt-4o)
├── index.html              → Frontend completo
└── vercel.json             → Config de Vercel
```

## Variables de entorno en Vercel
- RAINFOREST_API_KEY
- OPENAI_API_KEY

## Deploy
1. Sube todo a GitHub
2. Importa en Vercel
3. Añade las variables de entorno
