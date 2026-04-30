# juego-de-snake
# 🐍 Snake Game

Un juego clásico de Snake construido con **Next.js**, **Canvas** y **Supabase** para guardar puntajes.

---

## 🚀 Tecnologías

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase (Auth + Database)

---

## 🎮 Características

- Juego clásico de Snake
- Sistema de puntaje
- Guardado de scores en base de datos
- Soporte para usuarios (login opcional)
- Leaderboard (historial de puntuaciones)
- Interfaz moderna con Canvas

---

## 🔐 Autenticación

El proyecto usa Supabase Auth:

- Email / Password
- OAuth (Google / GitHub opcional)

---

## 🗄️ Base de datos

Tabla `scores`:

```sql
create table scores (
  id uuid primary key default gen_random_uuid(),
  score integer not null,
  user_id uuid,
  created_at timestamp with time zone default now()
);
