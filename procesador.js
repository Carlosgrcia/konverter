const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');

// Tamaño máximo para cada archivo dividido (en bytes)
const TAMAÑO_MAXIMO = 2.9 * 1024 * 1024; // 2.9MB para asegurar que el archivo final sea menor a 3MB

/**
 * Procesa un documento dividiéndolo en archivos de máximo 3MB
 * @param {string} rutaArchivo - La ruta al archivo original
 * @param {string} directorioSalida - El directorio donde se guardarán los archivos procesados
 * @returns {Promise<string[]>} - Una promesa que resuelve a un array de rutas de los archivos generados
 */
async function procesarDocumento(rutaArchivo, directorioSalida) {
  try {
    // Determinar el tipo de archivo por su extensión
    const extension = path.extname(rutaArchivo).toLowerCase();
    
    // Por ahora solo procesamos PDFs
    if (extension === '.pdf') {
      return await procesarPDF(rutaArchivo, directorioSalida);
    } else {
      // Para otros tipos, simplemente copiamos el archivo
      const nombreBase = path.basename(rutaArchivo);
      const rutaSalida = path.join(directorioSalida, nombreBase);
      fs.copyFileSync(rutaArchivo, rutaSalida);
      return [rutaSalida];
    }
  } catch (error) {
    console.error('Error en procesarDocumento:', error);
    throw error;
  }
}

/**
 * Procesa un PDF dividiéndolo si es necesario
 * @param {string} rutaPDF - La ruta al PDF original
 * @param {string} directorioSalida - El directorio donde se guardarán los PDF procesados
 * @returns {Promise<string[]>} - Una promesa que resuelve a un array de rutas de los PDF generados
 */
async function procesarPDF(rutaPDF, directorioSalida) {
  const nombreBase = path.basename(rutaPDF, '.pdf');
  const rutasProcesadas = [];
  
  try {
    // Leer el PDF
    const pdfBuffer = fs.readFileSync(rutaPDF);
    
    // Cargar el PDF existente
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const numPaginas = pdfDoc.getPageCount();
    
    // Para PDFs, dividiremos por páginas
    let paginasActuales = [];
    let tamanioActual = 0;
    let contadorArchivos = 1;
    
    console.log(`Procesando PDF con ${numPaginas} páginas...`);
    
    for (let i = 0; i < numPaginas; i++) {
      // Crear un nuevo documento para la página actual
      const paginaPDF = await PDFDocument.create();
      const [paginaCopiada] = await paginaPDF.copyPages(pdfDoc, [i]);
      paginaPDF.addPage(paginaCopiada);
      
      // Obtener el tamaño de esta página individual
      const paginaBuffer = await paginaPDF.save();
      const tamanioPagina = paginaBuffer.length;
      
      console.log(`Página ${i+1}: ${tamanioPagina} bytes`);
      
      // Si agregar esta página excede el tamaño máximo, guardar el lote actual y empezar uno nuevo
      if (tamanioActual + tamanioPagina > TAMAÑO_MAXIMO && paginasActuales.length > 0) {
        // Guardar el documento actual
        await guardarPDFPaginas(pdfDoc, paginasActuales, nombreBase, contadorArchivos, directorioSalida, rutasProcesadas);
        
        // Resetear para un nuevo documento
        paginasActuales = [i];
        tamanioActual = tamanioPagina;
        contadorArchivos++;
      } else {
        // Agregar esta página al lote actual
        paginasActuales.push(i);
        tamanioActual += tamanioPagina;
      }
    }
    
    // Guardar las páginas restantes si hay alguna
    if (paginasActuales.length > 0) {
      await guardarPDFPaginas(pdfDoc, paginasActuales, nombreBase, contadorArchivos, directorioSalida, rutasProcesadas);
    }
    
    return rutasProcesadas;
  } catch (error) {
    console.error(`Error al procesar PDF ${rutaPDF}:`, error);
    throw error;
  }
}

/**
 * Guarda un conjunto de páginas de un PDF en un nuevo archivo
 */
async function guardarPDFPaginas(pdfOriginal, numPaginas, nombreBase, contador, directorioSalida, rutasProcesadas) {
  try {
    console.log(`Guardando archivo ${contador} con ${numPaginas.length} páginas...`);
    
    // Crear un nuevo documento
    const nuevoDoc = await PDFDocument.create();
    
    // Copiar las páginas seleccionadas
    const paginasCopiadas = await nuevoDoc.copyPages(pdfOriginal, numPaginas);
    
    // Añadir cada página al nuevo documento
    for (const pagina of paginasCopiadas) {
      nuevoDoc.addPage(pagina);
    }
    
    // Configurar metadatos
    nuevoDoc.setProducer('Convertidor VUCEM');
    nuevoDoc.setCreator('Convertidor VUCEM');
    
    // Guardar el nuevo PDF
    const pdfBytes = await nuevoDoc.save();
    const rutaSalida = path.join(directorioSalida, `${nombreBase}_parte${contador}.pdf`);
    fs.writeFileSync(rutaSalida, pdfBytes);
    
    console.log(`Archivo guardado: ${rutaSalida}`);
    rutasProcesadas.push(rutaSalida);
  } catch (error) {
    console.error('Error al guardar páginas PDF:', error);
    throw error;
  }
}

module.exports = {
  procesarDocumento
}; 