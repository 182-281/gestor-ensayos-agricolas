# Gestor de Ensayos Agrícolas — Proyecto fuente (v0.6, instalable PWA)

Aplicación web propia para gestionar ensayos agrícolas: inventario de semillas,
fichas de ensayo, evaluaciones por parcela con variables editables por cultivo,
resultados por fecha y respaldo de datos.

Esta versión es una PWA (aplicación web progresiva): cumple todos los requisitos
de instalación de Chrome (verificado: sin errores de instalabilidad, funciona
sin conexión una vez cargada).

## Qué cambió en v0.6
- Semillas: se eliminó la tarjeta grande de Proveedores; queda solo el desplegable
  en el formulario de semilla, con "+ Agregar nuevo proveedor..." ahí mismo.
- Ensayos: el segmento ahora es Verano, Otoño, Invierno o Primavera; el campo
  "Especificaciones de segmento" sigue para detallar. Los ensayos que tenían otro
  valor de segmento lo conservan al editarlos.
- Consumo de semilla por ensayo: al crear o editar un ensayo se puede indicar la
  "Cantidad de semilla a usar" de la semilla vinculada. La tabla del inventario
  muestra el stock total y, al costado, la columna "Restante" (stock menos lo
  usado en todos los ensayos; en rojo si queda negativo). El desplegable de
  semilla del ensayo ahora lista TODAS las semillas del inventario, con su
  cultivo al inicio. Ensayos antiguos sin cantidad registrada no descuentan
  nada; semillas sin stock numérico muestran "—" en Restante.

## Qué cambió en v0.5
- Proveedores: ahora es un desplegable al registrar/editar una semilla, con lista
  inicial Hazera, Sakata, HM Clause y Vilmorin. La lista se administra en la
  pestaña Semillas (tarjeta "Proveedores") o desde el propio formulario con
  "+ Agregar nuevo proveedor...".
- Tipologías por cultivo: el campo Tipología del formulario de semilla es un
  desplegable filtrado según el cultivo elegido:
  - Cebolla: Rosada, Roja, Amarilla
  - Tomate: Saladete, Redondo, Cherry
  - Pimiento: Morrón, California, Lamuyo, Italiano Dulce, Piquillo
  - Zanahoria: Chantenay, Nantes, Kuroda
  - Pepinillo, Lechuga, Beterraga, Coliflor, Brócoli, Sandía y Melón: listas
    PROPUESTAS según el rubro semillero latinoamericano (ej.: Lechuga: Iceberg,
    Romana, Hoja, Mantecosa; Sandía: Crimson, Charleston, Mini, Sin pepitas).
    Son editables: con "+ Agregar nueva tipología..." se puede escribir cualquier
    otra y queda guardada en la lista de ese cultivo.
- Migración automática: los datos ya registrados no se pierden; los proveedores y
  tipologías escritos a mano en semillas anteriores se incorporan a las listas.

## Qué cambió en v0.4
- Ahora TODO lo guardado se puede editar, no solo quitar:
  - Semillas: botón "Editar" en cada fila del inventario (reutiliza el mismo formulario).
  - Ensayos: botón "Editar ficha del ensayo" en la ficha de cada ensayo.
    Tratamientos y repeticiones se bloquean si ya hay evaluaciones registradas
    (para no descuadrar las parcelas ya evaluadas).
  - Evaluaciones: botón "Editar" junto a cada evaluación en la ficha del ensayo;
    la planilla se abre con los valores ya cargados. Al abrir la planilla con una
    fecha que ya tiene evaluación, la app pregunta si se quiere editar la existente.
  - Cultivos: ahora también se puede corregir el nombre del cultivo (además de
    agregar, renombrar y quitar variables, que ya estaba en v0.2).
- La URL y los datos guardados en el celular no cambian: la app instalada se
  actualiza sola al abrirla con internet (nuevo cache del service worker).

## Qué cambió respecto a v0.2

- Nuevo: `manifest.webmanifest` (nombre, colores e iconos de la app).
- Nuevo: `sw.js` (service worker: guarda la app en el teléfono y la abre sin
  conexión).
- Nuevo: carpeta `` con los iconos de la app (incluye versión maskable).
- `index.html` ahora registra el manifest y el service worker.
- La lógica de la app (`app.js`) y los estilos no cambiaron.

## Cómo abrirla (modo desarrollo)

- Servir la carpeta y abrir http://localhost:8000
  - Python: `python3 -m http.server 8000` dentro de esta carpeta
  - Node: `npx serve .`
- OJO: con doble clic (file://) la app funciona, pero NO se registra el
  service worker (los navegadores lo exigen por seguridad).

## Cómo instalarla en el celular

Para instalarla, la app debe estar publicada en una dirección HTTPS (requisito
de los navegadores para PWAs). Opciones gratuitas de alojamiento estático:
GitHub Pages, Netlify, Vercel o Cloudflare Pages; en cualquiera se sube esta
carpeta tal cual y se obtiene una URL https.

Una vez publicada:
1. Abrir la URL en Chrome del teléfono Android.
2. Menú (tres puntos) > "Agregar a pantalla principal" / "Instalar app".
3. La app queda instalada con su icono y abre a pantalla completa.

IMPORTANTE sobre los datos:
- Los datos se guardan en el teléfono (localStorage) de cada instalación.
  Los datos ingresados en el prototipo v0.2 de escritorio NO se trasladan
  solos: usa "Descargar respaldo (JSON)" en un equipo y "Restaurar respaldo"
  en el otro.
- Desinstalar la app o borrar los datos del sitio borra los registros.

## Estructura

- `index.html` — esqueleto: encabezado, pestañas, registro de PWA. Todos los archivos van juntos en una sola carpeta (sin subcarpetas).
- `manifest.webmanifest` — nombre, colores e iconos de la app instalada.
- `sw.js` — service worker (cache de la app, modo sin conexión). Si cambias
  archivos, sube la versión del cache (variable CACHE) para que se actualice.
- `styles.css` — colores, tablas, tarjetas y formularios. El color
  principal se cambia en `:root` (`--verde`, `--verde-osc`); actualiza también
  `theme_color` del manifest.
- `` — iconos PNG (192, 512, maskable y apple-touch).
- `app.js` — toda la lógica. Secciones marcadas con comentarios:
  - `CULTIVOS_INICIALES`: los 11 cultivos y sus variables iniciales. Solo
    aplican la primera vez que alguien abre la app; después se editan desde
    la pestaña Cultivos.
  - `TIPOS_ENSAYO`, `SEGMENTOS`, `CONCLUSIONES`: opciones de los selectores.
  - `Estado y persistencia`: lectura/escritura en localStorage
    (clave `gestorEnsayosV1`).
  - `Respaldo`: descarga y restauración del respaldo completo en JSON.
  - `exportarCSV`: exportación de evaluaciones a CSV (separador `;`).

## Cómo modificarla

1. Edita los archivos con cualquier editor de texto o código.
2. Sube la versión del cache en `sw.js` (por ejemplo de v0.3 a v0.3.1).
3. Guarda, recarga forzando (Ctrl+F5) y verifica creando un ensayo de prueba.

## Límites de esta versión

- No es un APK de Play Store: es una PWA instalable desde el navegador.
- Los datos viven en cada dispositivo; no hay sincronización entre equipos
  ni multiusuario. Usa el respaldo JSON para mover datos.
- Los resultados son promedios simples por tratamiento y fecha; no incluye
  análisis estadístico (ANOVA) todavía.
