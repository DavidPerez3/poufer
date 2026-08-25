# POUFER

Mascota virtual humorística basada en Mapofer. Una única base de código para Android (APK más adelante) y Web/PWA para iPhone y navegador.

## Stack

- Expo SDK 57
- React Native + React Native Web
- Expo Router
- TypeScript
- Zustand
- AsyncStorage
- GitHub Pages para la PWA

## Fase 0.1 — implementada

La primera base jugable incluye:

- pantalla principal vertical pensada para móvil;
- Mapofer provisional sin gafas de sol para que los ojos formen parte del estado visual;
- riñonera/bandolera como parte del diseño del personaje;
- Hambre, Higiene, Sueño y Aburrimiento;
- paso del tiempo incluso después de cerrar la app (con límite inicial de 48 h de progreso offline);
- acciones básicas de comer, ducharse, dormir y ver anime;
- estado general derivado de las necesidades;
- persistencia local;
- Mapocoins preparadas en el modelo de estado;
- manifiesto PWA y service worker;
- export estático compatible con GitHub Pages.

Farmacia y Bar aparecen como próximos módulos, pero todavía no forman parte de la lógica de esta fase.

## Desarrollo local

```bash
npm install
npm start
```

Para abrir Web:

```bash
npm run web
```

Para comprobar TypeScript:

```bash
npm run typecheck
```

Para generar la web estática:

```bash
npm run export:web
```

Expo genera el resultado en `dist/`.

## GitHub Pages

El proyecto está configurado para vivir bajo `/poufer`, por lo que la URL prevista es:

`https://davidperez3.github.io/poufer/`

El workflow `.github/workflows/pages.yml` compila y publica automáticamente cada push a `main`.

### Activación inicial (una sola vez)

En GitHub abre:

**Settings → Pages → Build and deployment → Source → GitHub Actions**

Después, el workflow se encargará de los despliegues posteriores.

## Estructura

```text
src/
├── app/              # Rutas y pantallas
├── components/       # UI reutilizable
├── domain/           # Tipos y reglas de Mapofer
├── hooks/            # Reloj del juego
├── store/            # Estado y persistencia
└── theme/            # Diseño visual

public/
├── icon.svg
├── manifest.webmanifest
└── sw.js
```

## Siguiente fase

Fase 0.2: Farmacia, estados alterados iniciales y sistema extensible de objetos/efectos.
