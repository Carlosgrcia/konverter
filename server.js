const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { procesarDocumento } = require('./procesador');

const app = express();
const port = process.env.PORT || 3000;

// Configurar el almacenamiento para los archivos subidos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // Límite de 50MB para archivos
});

// Configurar carpeta para archivos procesados
const outputDir = path.join(__dirname, 'archivos_procesados');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Servir archivos estáticos
app.use(express.static('public'));

// Ruta para subir y procesar archivos
app.post('/convertir', upload.single('documento'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    const rutaArchivo = req.file.path;
    const archivosGenerados = await procesarDocumento(rutaArchivo, outputDir);
    
    // Enviar las rutas de los archivos generados
    res.json({ 
      mensaje: 'Documento procesado exitosamente', 
      archivos: archivosGenerados.map(archivo => `/descargar/${path.basename(archivo)}`)
    });
  } catch (error) {
    console.error('Error al procesar el documento:', error);
    res.status(500).json({ error: 'Error al procesar el documento' });
  }
});

// Ruta para descargar archivos procesados
app.get('/descargar/:nombre', (req, res) => {
  const nombreArchivo = req.params.nombre;
  const rutaArchivo = path.join(outputDir, nombreArchivo);
  
  if (fs.existsSync(rutaArchivo)) {
    res.download(rutaArchivo);
  } else {
    res.status(404).json({ error: 'Archivo no encontrado' });
  }
});

app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
}); 