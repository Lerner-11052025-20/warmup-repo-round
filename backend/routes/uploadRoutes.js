const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { protect } = require('../middleware/auth');

// Setup Cloudinary config with user's provided details
cloudinary.config({
  cloud_name: 'dom61gprg',
  api_key: '727277664599364',
  api_secret: 'eVR2sBn9Id0CfTZRNvRa1Ot8u98'
});

// Configure Multer for in-memory storage temporarily
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // accept images and pdfs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type! Only images and PDFs are allowed.'), false);
    }
  }
});

router.post('/', protect, upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    
    // Determine the resource resource_type depending on mimetype
    const resourceType = req.file.mimetype === 'application/pdf' ? 'auto' : 'image';

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'smartflow_receipts',
      resource_type: resourceType
    });

    res.status(200).json({ 
      success: true, 
      url: result.secure_url 
    });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    res.status(500).json({ message: 'Failed to upload receipt', error: error.message });
  }
});

module.exports = router;
