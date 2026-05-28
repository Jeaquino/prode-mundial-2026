# Prode Mundial 2026

Aplicacion web estatica para organizar un prode del Mundial 2026 usando el modo oficial:
solo se pronostican los partidos desbloqueados por el organizador.

## Reglas implementadas

- Marcador exacto: 5 puntos.
- Empate correcto no exacto: 4 puntos.
- Diferencia de gol + ganador: 4 puntos.
- Solo ganador: 3 puntos.
- Errado: 0 puntos.
- Eliminacion: ganador final correcto suma 1 punto extra; ganador final incorrecto resta 1 punto.

## Uso local

Abrir `index.html` en el navegador o servir la carpeta con cualquier web server.

```powershell
cd C:\apps\codex\prode-mundial-2026
python -m http.server 4173
```

Luego entrar a `http://localhost:4173`.

## Deploy con Docker

```powershell
docker build -t prode-mundial-2026 .
docker run --rm -p 8080:80 prode-mundial-2026
```

## Persistencia

La version inicial guarda datos en `localStorage` del navegador e incluye exportacion/importacion
JSON desde la pantalla de ranking/admin. Para multiusuario real, el siguiente paso natural es
reemplazar ese storage por una API pequena con PostgreSQL o Supabase self-hosted.
