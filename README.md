# PokeHabit

PokeHabit convierte tus hábitos, tareas domésticas y sesiones de estudio en una aventura Pokémon. Completa objetivos, gana experiencia, cuida a tu equipo y desbloquea nuevos logros.

## Funcionalidades

- Gestión de hábitos, tareas y sesiones Pomodoro.
- Equipo Pokémon, cuidados, evoluciones, Pokédex y tienda.
- Registro con elección de skin y Pokémon starter.
- Perfil de entrenador y sincronización opcional con Firebase.

## Desarrollo local

**Requisitos:** Node.js

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Variables de entorno

Copia `.env.example` como `.env` y configura las variables de Firebase si quieres activar cuentas y sincronización en la nube. Las claves locales no deben subirse al repositorio.

## Comandos

```bash
npm run dev     # Servidor de desarrollo
npm run build   # Compilación de producción
npm run lint    # Comprobación de TypeScript
```
