const { jsPDF } = window.jspdf;

const workerRecords = [];

function scanFace() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Tu navegador no soporta la API de getUserMedia.');
    return;
  }

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
      const videoElement = document.createElement('video');
      videoElement.setAttribute('autoplay', true);
      videoElement.style.width = '100%';
      videoElement.style.height = 'auto';
      videoElement.srcObject = stream;

      const cameraFeed = document.getElementById('camera-feed');
      cameraFeed.innerHTML = '';
      cameraFeed.appendChild(videoElement);

      const captureButton = document.createElement('button');
      captureButton.textContent = 'Capturar Foto';
      captureButton.classList.add('capture-btn');
      captureButton.addEventListener('click', function() {
        capturePhoto(videoElement);
      });
      cameraFeed.appendChild(captureButton);
    })
    .catch(function (error) {
      alert('No se pudo acceder a la cámara: ' + error.message);
    });
}

function capturePhoto(videoElement) {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const context = canvas.getContext('2d');
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  const photo = canvas.toDataURL('image/png');

  const photoElement = document.createElement('img');
  photoElement.src = photo;
  document.getElementById('photo-container').innerHTML = '';
  document.getElementById('photo-container').appendChild(photoElement);
}

function generateBadgeNumber() {
  return Math.floor(100000 + Math.random() * 900000);
}

function addWorkerRecord() {
  const name = document.getElementById('name').value;
  const lastname = document.getElementById('lastname').value;
  const age = document.getElementById('age').value;
  const position = document.getElementById('position').value;
  const department = document.getElementById('department').value;
  const badgeNumber = generateBadgeNumber();
  const photo = document.querySelector('#photo-container img');

  if (!name || !lastname || !position || !department || !photo) {
    alert('Por favor, completa todos los campos y captura una foto.');
    return;
  }

  const worker = { name, lastname, age, position, department, badgeNumber };
  workerRecords.push(worker);

  generateWorkerBadgePDF(worker, photo.src);
}

function generateWorkerBadgePDF(worker, photoSrc) {
  const pdf = new jsPDF({ orientation: 'landscape', format: 'a5' });
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);

  pdf.setFillColor(230, 230, 230);
  pdf.roundedRect(10, 10, 180, 120, 10, 10, 'F');

  pdf.setTextColor(0, 51, 102);
  pdf.text('CARNET DE TRABAJADOR', 105, 25, { align: 'center' });
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.text('Bienvenido a FaceSecure', 105, 35, { align: 'center' });

  pdf.setTextColor(50, 50, 50);
  pdf.text(`Nombre: ${worker.name} ${worker.lastname}`, 20, 55);
  pdf.text(`Edad: ${worker.age}`, 20, 70);
  pdf.text(`Puesto: ${worker.position}`, 20, 85);
  pdf.text(`Depto: ${worker.department}`, 20, 100);
  pdf.text(`Gafete: ${worker.badgeNumber}`, 20, 115);

  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(135, 45, 50, 50, 10, 10, 'F');
  pdf.addImage(photoSrc, 'PNG', 140, 50, 40, 40, '', 'FAST');

  pdf.save(`Carnet_${worker.name}_${worker.lastname}.pdf`);
}

function shareByEmail() {
  if (workerRecords.length === 0) {
    alert('No hay registros para compartir.');
    return;
  }

  const worker = workerRecords[workerRecords.length - 1];

  const subject = encodeURIComponent(`Carnet de ${worker.name} ${worker.lastname}`);
  const body = encodeURIComponent(
    `Hola,\n\n\Bienvenido a FaceSecure\nAdjunto el carnet de trabajador:\n\n` +
    `🔹 Nombre: ${worker.name} ${worker.lastname}\n` +
    `🔹 Edad: ${worker.age}\n` +
    `🔹 Puesto: ${worker.position}\n` +
    `🔹 Departamento: ${worker.department}\n` +
    `🔹 Gafete: ${worker.badgeNumber}\n\n` +
    `Saludos.`
  );

  const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
  window.location.href = mailtoLink;
}




