const express = require('express');
const multer = require('multer');
const cors = require('cors'); 
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Configura la aplicación Express
const app = express();
const PORT = 3000;

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(cors({ origin: 'http://192.168.0.21:4200' }));

// Configura Multer para gestionar la carga de archivos
const upload = multer({ dest: 'uploads/' });

// Configura la autenticación de la cuenta de servicio
const KEYFILEPATH = path.join(__dirname, 'uriydani.json'); // Ruta al archivo JSON de la cuenta de servicio
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

// Endpoint para subir una foto a Google Drive
app.post('/upload', upload.single('file'), async (req, res) => {
  console.log('Subiendo archivo a Google Drive...');
  
  try {
    const filePath = req.file.path;
    const fileMetadata = {
      name: req.file.originalname,
      parents: ['1QvMXts6IwHxWhakVs8fxHAADkExRnXxV'], // Reemplaza FOLDER_ID con el ID de la carpeta compartida
    };

    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(filePath),
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    fs.unlinkSync(filePath); // Elimina el archivo de la carpeta local después de subirlo
    res.status(200).json({ fileId: file.data.id, message: 'Archivo subido exitosamente a Google Drive' });
  } catch (error) {
    console.error('Error al subir el archivo a Google Drive:', error);
    res.status(500).send('Error al subir el archivo');
  }
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
