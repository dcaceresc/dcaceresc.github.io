# ✨ Mi Sitio Personal

¡Bienvenido/a a mi sitio personal!  
Aquí encontrarás una presentación sobre mí, mi trayectoria académica y profesional, mis habilidades principales y un blog donde comparto ideas, proyectos y aprendizajes.

## Desarrollo local

Requiere Node.js ≥22.23.4 y npm ≥9.6.5. Se recomienda Node.js 24, la versión utilizada en GitHub Pages.

```sh
npm ci
npm run dev
```

Para verificar la compilación de producción y previsualizarla:

```sh
npm run build
npm run preview
```

## Verificación de portada y navegación

```sh
npm run build && node --test tests/portfolio.test.mjs
```

Las pruebas comprueban el HTML generado: presentación profesional, enlaces de proyectos y contacto, orden del menú, sección activa en cada página y atributos del menú móvil. No sustituyen la revisión visual ni la interacción con el menú en un navegador.

