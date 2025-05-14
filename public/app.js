document.addEventListener('DOMContentLoaded', () => {
  // Referencias a elementos DOM
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const fileInfo = document.getElementById('file-info');
  const fileName = document.getElementById('file-name');
  const fileSize = document.getElementById('file-size');
  const convertBtn = document.getElementById('convert-btn');
  const processingSection = document.getElementById('processing-section');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const resultSection = document.getElementById('result-section');
  const resultFiles = document.getElementById('result-files');
  const newConversionBtn = document.getElementById('new-conversion-btn');

  // Variable para almacenar el archivo seleccionado
  let selectedFile = null;

  // Funciones de utilidad
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const showFileInfo = (file) => {
    selectedFile = file;
    fileName.textContent = file.name;
    fileSize.textContent = formatBytes(file.size);
    fileInfo.style.display = 'flex';
  };

  const resetUI = () => {
    fileInfo.style.display = 'none';
    processingSection.style.display = 'none';
    resultSection.style.display = 'none';
    progressBar.style.width = '0%';
    resultFiles.innerHTML = '';
    selectedFile = null;
  };

  // Eventos para drag and drop
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('active');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('active');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('active');
    
    if (e.dataTransfer.files.length > 0) {
      showFileInfo(e.dataTransfer.files[0]);
    }
  });

  // Evento para selección de archivo mediante botón
  dropzone.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      showFileInfo(fileInput.files[0]);
    }
  });

  // Evento para iniciar la conversión
  convertBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    // Mostrar sección de procesamiento
    fileInfo.style.display = 'none';
    processingSection.style.display = 'block';
    
    // Simular progreso
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress > 90) {
        clearInterval(interval);
      }
      progressBar.style.width = `${progress}%`;
    }, 300);

    // Preparar datos para enviar
    const formData = new FormData();
    formData.append('documento', selectedFile);

    try {
      // Enviar archivo al servidor
      const response = await fetch('/convertir', {
        method: 'POST',
        body: formData
      });

      clearInterval(interval);
      
      if (!response.ok) {
        throw new Error('Error al procesar el documento');
      }

      const data = await response.json();
      
      // Actualizar barra de progreso al 100%
      progressBar.style.width = '100%';
      progressText.textContent = '¡Procesamiento completado!';
      
      // Mostrar resultados después de un breve retraso
      setTimeout(() => {
        processingSection.style.display = 'none';
        resultSection.style.display = 'block';
        
        // Mostrar archivos para descargar
        if (data.archivos && data.archivos.length > 0) {
          data.archivos.forEach(archivo => {
            const fileElement = document.createElement('div');
            fileElement.className = 'result-file';
            
            const nameElement = document.createElement('div');
            nameElement.className = 'file-name';
            nameElement.textContent = archivo.split('/').pop();
            
            const downloadBtn = document.createElement('a');
            downloadBtn.className = 'download-btn';
            downloadBtn.href = archivo;
            downloadBtn.textContent = 'Descargar';
            downloadBtn.download = '';
            
            fileElement.appendChild(nameElement);
            fileElement.appendChild(downloadBtn);
            resultFiles.appendChild(fileElement);
          });
        } else {
          resultFiles.innerHTML = '<p>No se generaron archivos. Por favor, intenta con otro documento.</p>';
        }
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      clearInterval(interval);
      progressBar.style.width = '100%';
      progressText.textContent = 'Error al procesar el documento. Por favor, intenta de nuevo.';
      progressText.style.color = 'var(--error-color)';
    }
  });

  // Evento para iniciar una nueva conversión
  newConversionBtn.addEventListener('click', () => {
    resetUI();
  });
}); 