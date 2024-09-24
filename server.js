import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import logger from './Utils/logger.js'; 
import upload from './upload.js'; 
import submitFormRoute from './Routes/submitDataRoutes.js';
import checkEntryRoutes from './Routes/checkEntryRoute.js';
import displayRoutes from './Routes/displayRoutes.js';
import updateReviewStatus from './Routes/updateReviewStatus.js'
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 5000;
const dbName = 'PMSF';
const url = 'mongodb+srv://ahmedahxam:1234@cluster0.3fs3r1f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(url);
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

logger.info('Logger initialized successfully');


// CORS setup
const allowedOrigins = [
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'https://rhsk3l6j-5173.inc1.devtunnels.ms',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));


app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(express.json({ limit: '50mb' }));

// Serve Images
app.get('/images/:year/:imageName', (req, res) => {
  const { year, imageName } = req.params;
  const imagePath = path.join(process.cwd(), 'Images', year, imageName);
  console.log('Full Image Path:', imagePath);

  if (fs.existsSync(imagePath)) {
    console.log('Image exists.');
    res.sendFile(imagePath);
  } else {
    console.log('Image does not exist.');
    res.status(404).send('Image not found');
  }
});

// MongoDB Middleware
let dbInstance = null;

async function mongoMiddleware(req, res, next) {
  if (!dbInstance) {
    try {
      const db = await client.connect();
      dbInstance = db.db(dbName);  // Cache the database instance
    } catch (err) {
      logger.error('Database connection error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  req.db = dbInstance;
  next();
}


app.use(mongoMiddleware);

// Branch Code Lookup Route
async function fetchBranchByCode(req, res) {
  const branchCode = req.params.code;
  logger.info('Received branch code:', branchCode);

  try {
    const collection = req.db.collection('Branches');
    const branch = await collection.findOne({ 'Branch_Code': branchCode });

    logger.info('Branch found:', branch);
    if (branch) {
      res.json({
        success: true,
        data: {
          'Branch_Name': branch['Branch_Name'],
          'Region': branch['Region']
        }
      });
    } else {
      res.json({ success: false, message: "No branch found" });
    }
  } catch (err) {
    logger.error('Error in /branch/:code:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

app.get('/branch/:code', fetchBranchByCode);
app.use('/update-review-status', updateReviewStatus); 
// Use the imported routes for /check-entry and /submit-form
app.use('/check-entry', checkEntryRoutes);
app.use('/submit-form', upload, submitFormRoute);
app.use(displayRoutes);
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});
