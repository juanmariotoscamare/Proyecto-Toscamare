# Guía de Desarrollo y Mantenimiento - Proyecto Toscamare

Este documento está diseñado para que cualquier desarrollador o persona con conocimientos técnicos pueda entender, modificar, añadir o eliminar partes de la página web de Toscamare fácilmente.

---

## 1. Arquitectura del Proyecto

El proyecto está dividido en dos partes principales que se comunican entre sí:

*   **Frontend (Carpeta `/frontend`):** Es la interfaz visual de la web. Está construida usando **React**, **Vite**, **TypeScript** y **Tailwind CSS**.
*   **Backend (Carpeta `/backend`):** Es el motor lógico que procesa el envío de correos (Avisos de Contacto y Pedidos). Está programado en **PHP** puro utilizando la librería **PHPMailer**.
*   **Servidor de Producción:** Alojado en **Ionos** (servidor Apache). Todo el enrutamiento, caché y seguridad del servidor se maneja mediante el archivo `.htaccess`.

---

## 2. Estructura de Carpetas

Entender dónde está cada cosa es el primer paso para modificar la web:

```text
Proyecto-Toscamare/
├── backend/
│   └── api/
│       ├── config.php       # ¡IMPORTANTE! Aquí van las contraseñas de los correos. (No subir a GitHub)
│       ├── contact.php      # Script principal que recibe las peticiones de React y envía los emails.
│       └── PHPMailer/       # Librería de terceros para envío seguro de emails mediante SMTP.
│
├── frontend/
│   ├── public/              # Archivos estáticos que no pasan por Vite (.htaccess, robots.txt, CSVs).
│   ├── src/
│   │   ├── assets/          # Imágenes de la web, iconos, vídeos y fuentes.
│   │   ├── components/      # "Trozos" de código reutilizables (botones, formularios, tarjetas).
│   │   ├── data/            # Datos estáticos (ej. ubicaciones de tiendas en TypeScript).
│   │   ├── layout/          # Estructura principal de la web (Header, Footer, MainLayout).
│   │   ├── pages/           # Cada una de las pestañas de la web (Inicio, Contacto, Pedidos, etc.).
│   │   ├── lib/ & utils/    # Funciones de ayuda y animaciones.
│   │   ├── App.tsx          # Configuración del enrutador (React Router). Define qué página carga cada URL.
│   │   └── main.tsx         # Punto de entrada de la aplicación React.
│   ├── package.json         # Dependencias y scripts del proyecto (npm).
│   └── vite.config.ts       # Configuración del empaquetador Vite.
```

---

## 3. Guía de Tareas Comunes (Frontend)

### Preparar el entorno local
Para probar la web en tu ordenador, abre la terminal en la carpeta `/frontend` y ejecuta:
1. `npm install` (Solo la primera vez, para descargar las dependencias).
2. `npm run dev` (Arranca el servidor de pruebas en `http://localhost:5173`).

### ¿Cómo añadir o modificar una Página/Sección?
1. Ve a `frontend/src/pages/` y busca la página que quieres cambiar (por ejemplo, `Contacto.tsx` o `sobreNosotros/`).
2. Si quieres editar un bloque específico (por ejemplo, el "Hero" de inicio), ve a `frontend/src/components/inicioBloques/`.
3. Todos los estilos se manejan con **Tailwind CSS** (clases como `className="flex flex-col text-center bg-blue-500"`). Para cambiar colores o tamaños, simplemente edita esas clases en el HTML.

### ¿Cómo cambiar los enlaces del Menú de Navegación?
1. El menú superior está en `frontend/src/layout/Header.tsx`.
2. El pie de página está en `frontend/src/layout/Footer.tsx`.

### ¿Cómo añadir una página nueva?
1. Crea un archivo nuevo en `frontend/src/pages/` (ej. `NuevaPagina.tsx`).
2. Ve a `frontend/src/App.tsx`.
3. Importa tu nueva página arriba: `import NuevaPagina from './pages/NuevaPagina';`
4. Añádela a las rutas: `<Route path="/nueva-pagina" element={<NuevaPagina />} />`
5. Añade un enlace en el `Header.tsx` apuntando a `/nueva-pagina`.

### ¿Cómo cambiar un texto de la web (Horarios, Teléfonos, Fechas, Textos informativos)?
No necesitas saber programar para cambiar textos simples, horarios, datos de tiendas o fechas. Sigue estos pasos usando el programa VS Code:
1. Pon el ratón sobre la **lupa** que hay en la barra izquierda de VS Code (o pulsa `Ctrl + Mayús + F`).
2. En el buscador que se abre, escribe EXACTAMENTE el texto que quieres cambiar (por ejemplo: `8:00 - 15:00` o la dirección de una tienda).
3. Abajo te saldrá una lista con los archivos donde aparece ese texto. Haz clic en uno de ellos.
4. Verás el texto escrito entre comillas o etiquetas (ej: `<div>8:00 - 15:00</div>`). Borra el texto viejo, escribe el nuevo con cuidado de no borrar los símbolos de alrededor, y guarda pulsando **`Ctrl + S`**. ¡Listo!

### ¿Cómo cambiar las Imágenes del Inicio, Sobre Nosotros, Tiendas o el Logo?
Para cambiar cualquier foto de estas secciones ¡no tienes que tocar código! Solo hacer un cambiazo de archivos. Te recomendamos usar siempre formato **`.webp`** ya que hace que la web cargue mucho más rápido.
1. Entra a la carpeta de tu ordenador donde están las fotos de la web: `Proyecto-Toscamare/frontend/src/assets/`.
2. Ahí dentro verás otras carpetas (`imagenes_home`, `fotos_sobre_nosotros`, `tiendas`, etc.). Entra y busca la foto que quieres cambiar y fíjate en su **nombre exacto** y **formato** (por ejemplo: `tienda-cartaya.webp`).
3. Coge tu foto nueva y ponle exactamente ese mismo nombre y extensión.
4. Arrastra tu foto nueva a la carpeta y dale a **Reemplazar**. La página cogerá la nueva foto automáticamente.
*Nota:* El logo principal está guardado en otra ruta diferente: `frontend/public/logoToscamare/`. Sigue el mismo proceso de reemplazar para cambiarlo.

### ¿Cómo cambiar las Imágenes de las Categorías de Productos?
Al igual que las imágenes de arriba, los productos no hace falta programarlos, cogen sus fotos automáticamente a partir del nombre de su categoría en el Excel.
1. Entra a la carpeta `frontend/src/assets/imagenes_categorias/`.
2. Verás fotos llamadas exactamente como tus categorías (ej: `Pescados.webp`, `Carnes.webp`).
3. Si quieres cambiar la foto de los pescados, coge tu nueva foto, llámala `Pescados.webp`, arrástrala a esa carpeta y dale a Reemplazar.
4. ¡Si añades una categoría nueva en tu Excel, asegúrate de meter aquí una foto con ese mismo nombre para que no salga en blanco!

---

## 4. Guía de Tareas Comunes (Backend)

### ¿Cómo modificar los correos o contraseñas?
1. En producción, entra al panel de Ionos y edita el archivo `api/config.php`.
2. Ahí podrás cambiar el `email_destino` (quién recibe los avisos) y el `password` (la contraseña de la cuenta para usar el SMTP).

### ¿Cómo cambiar el diseño del correo que llega a la empresa?
1. Abre `backend/api/contact.php`.
2. Busca la variable `$htmlBody` (sobre la línea 150). Ahí está todo el código HTML con el diseño del correo. Puedes cambiar colores, añadir el logo de la empresa por URL, etc.

---

## 5. Proceso de Subida a Producción (Despliegue en Ionos)

Cuando hayas hecho cambios en tu ordenador local y quieras subirlos a la web real (`toscamare.es`):

1. Abre la terminal en la carpeta `/frontend`.
2. Ejecuta el comando: `npm run build`
    *   *Esto comprimirá y optimizará todo tu código React.*
3. Se generará una carpeta llamada `/frontend/dist`.
4. Abre tu programa de FTP (como FileZilla) o el panel de archivos de Ionos.
5. Sube **el contenido interior** de la carpeta `dist` a la carpeta raíz pública de Ionos (`/`).
6. Si hiciste cambios en el PHP, sube también la carpeta `/backend/api` a esa misma raíz de Ionos (quedando como una subcarpeta llamada `api/`).

### ¡Atención al archivo `.htaccess`!
En la carpeta `frontend/public/` hay un archivo oculto llamado `.htaccess`. Este archivo se copia automáticamente a `dist/` al hacer el *build*.
**Es crucial no borrarlo de Ionos**. Este archivo se encarga de:
1.  Hacer que funcionen las descargas rápidas (Caché).
2.  Comprimir los archivos (GZIP) para que la web cargue muy rápido.
3.  Proteger la web de hackers (Cabeceras SSL y Anti-XSS).
4.  Permitir que las rutas de React funcionen sin dar Error 404.
5.  Redirigir las URLs antiguas de la versión antigua de la web a las nuevas para mantener el SEO.

---

## 6. Propuesta a Futuro: Imágenes Individuales por Producto

Actualmente, los productos cogen la imagen genérica de su categoría. Si en un futuro se desea que **cada producto tenga su propia foto exacta**, aquí dejamos documentada la idea de cómo implementarlo fácilmente:

1. **Preparar las Imágenes**:
   - Todas las fotos nuevas de los productos deben guardarse en una carpeta dedicada (por ejemplo, `frontend/public/imagenes_productos/`).
   - Es sumamente importante convertirlas todas al formato **`.webp`** antes de subirlas. Este formato pesa muy poco y garantiza que el catálogo no se vuelva lento a pesar de tener cientos de fotos.
2. **Modificar el Excel (CSV)**:
   - En el archivo `frontend/public/productos_destacados.csv`, habría que añadir una nueva columna (por ejemplo llamada `Ruta_Imagen`).
   - Para cada producto, en esa columna simplemente pegarías el nombre de su foto. Opcionalmente, se podrían dejar filas vacías para que algunos productos sigan usando la foto genérica.
3. **Adaptar el Código (Frontend)**:
   - En el código de React que lee el Excel (`Productos.tsx`), habría que darle una pequeña instrucción: "Si la columna `Ruta_Imagen` tiene texto, usa esa foto. Si está vacía, usa la foto de la categoría". 

De esta forma, en el futuro no hará falta realizar una gran reestructuración; el sistema simplemente bebería del Excel como lo hace ahora, pero siendo más específico.