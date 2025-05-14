# Convertidor de Documentos VUCEM

Aplicación web para convertir documentos PDF y dividirlos en archivos menores a 3MB.

## Características

- Divide archivos PDF en múltiples partes de menos de 3MB cada una
- Interfaz de usuario amigable con funcionalidad de arrastrar y soltar
- Soporte para documentos con múltiples páginas

## Requisitos

- Node.js (versión 18.x)
- npm (versión 8.x)

## Instalación

1. Clona este repositorio o descarga los archivos del proyecto.
2. Navega al directorio del proyecto y ejecuta:

```bash
npm install
```

## Problema conocido y solución

Esta aplicación fue originalmente diseñada para convertir también imágenes a 300 DPI, pero debido a incompatibilidades con la versión actual de Node.js (v18.12.0) y la biblioteca Sharp, esta funcionalidad está temporalmente deshabilitada.

**Soluciones posibles:**

1. Actualizar Node.js a v18.17.0 o superior:

```bash
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# Reiniciar terminal y ejecutar:
nvm install 18.17.0
# o
nvm install --lts
```

2. Continuar con la versión actual con funcionalidad limitada (sólo procesamiento de PDFs)

## Uso

1. Inicia el servidor:

```bash
node server.js
```

2. Abre tu navegador y visita:

```
http://localhost:3000
```

3. Arrastra un documento o haz clic para seleccionar uno.
4. Presiona el botón "Convertir" para iniciar el proceso.
5. Una vez completado, descarga los archivos resultantes.

## Estructura del Proyecto

- `server.js` - Servidor Express que maneja las solicitudes HTTP
- `procesador.js` - Lógica para dividir documentos PDF
- `public/` - Archivos estáticos para el cliente
  - `index.html` - Página web principal
  - `styles.css` - Estilos de la interfaz
  - `app.js` - Lógica del cliente
  - `upload-icon.svg` - Icono para la interfaz

## Formatos Soportados

- PDF (completo)
- Otros formatos (sólo funcionan como pasarela, sin procesamiento)

## Limitaciones

- El tamaño máximo de archivo para cargar es de 50MB
- Los archivos se dividen en partes de máximo 3MB cada una

## Licencia

Este proyecto está licenciado bajo la licencia ISC.

## Autor

Desarrollado por Carlos García
