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

## Fase 0.1 — estable

La primera base jugable incluye:

- pantalla principal vertical pensada para móvil;
- Mapofer provisional sin gafas de sol para que los ojos formen parte del estado visual;
- riñonera/bandolera como parte del diseño del personaje;
- Hambre, Higiene, Sueño y Aburrimiento;
- paso del tiempo incluso después de cerrar la app (con límite inicial de 48 h de progreso offline);
- actualización inmediata al volver del segundo plano;
- acciones básicas de comer, ducharse, dormir y ver anime;
- motor de necesidades desacoplado de la interfaz y preparado para efectos configurables;
- estado general derivado de las necesidades;
- persistencia local versionada y saneada;
- Mapocoins preparadas en el modelo de estado;
- manifiesto PWA, iconos raster/maskable, icono de iOS y service worker;
- export estático compatible con GitHub Pages.

## Fase 0.2 — Farmapofer

- ruta de Farmacia integrada en Expo Router;
- catálogo genérico de objetos y efectos mediante `useItem(itemId)`;
- Pastilla y Pollo como objetos ficticios/cartoon;
- inventario local inicial de pruebas, sin adelantar la tienda de la fase 0.7;
- Ansia, Alterado, Sudor y Energía persistentes;
- estado `FINO` y ojos dilatados derivados del estado del personaje;
- animaciones alternas de mandíbula, lengua, cabeza y sudor;
- efectos activos con duración y progreso offline;
- migración automática de las partidas de fase 0.1.

## Fase 0.3 — Una y nos vamos

- Barpofer con cerveza, marianito rojo, cubata y chupito;
- borrachera y resaca persistentes;
- estados derivados BORRACHO y RESACOSO;
- ojos entornados, rubor y balanceo cartoon;
- primera mejora del escenario y personaje hacia la referencia visual.

## Fase 0.4 — Fumar

- pantalla Fumar con cigarro y porro mediante el catálogo genérico de objetos;
- humo cartoon y objeto visible mientras dura el efecto;
- ojos rojos y estado `EMPANADO` derivados del porro;
- relación jugable porro → hambre → comida;
- persistencia y migración automática del inventario de pruebas.

## Fase 0.5 — Vida digna

- comida configurable: kebab, pizza, hamburguesa, patatas y bocata;
- vejiga e intestino afectados por el tiempo y los alimentos;
- habitación de baño con ducha, mear, cagar y limpiar;
- cacas cartoon con caras, acumulables y persistentes;
- penalización progresiva de higiene por suciedad acumulada;
- dormir se mantiene como cuidado básico y persistente.

## Fase 0.14 — POUFER se pone guapo (reservada)

Overhaul visual completo antes de 1.0: personaje chibi definitivo de cuerpo entero,
ropa streetwear, habitaciones ilustradas, botones e iconos propios, barra superior,
navegación inferior y animaciones específicas de todos los estados. La referencia
visual aportada marca la dirección artística; no se copiarán assets externos.

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

Para ejecutar de una vez TypeScript, pruebas de dominio, export y validación PWA:

```bash
npm run check
```

## GitHub Pages

El proyecto está configurado para vivir bajo `/poufer`, por lo que la URL prevista es:

`https://davidperez3.github.io/poufer/`

El workflow `.github/workflows/pages.yml` instala con `npm ci`, comprueba TypeScript,
ejecuta las pruebas del motor, exporta, valida el artefacto de GitHub Pages y publica
automáticamente cada push a `main`.

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

Fase 0.6: ocio, aburrimiento desarrollado, anime y primeras actividades.
