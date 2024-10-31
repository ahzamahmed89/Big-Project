import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import logger from './Utils/logger.js'; 
import upload from './upload.js'; 
import submitDataRoutes from './Routes/submitDataRoutes.js';
import checkEntryRoutes from './Routes/checkEntryRoute.js';
import displayRoutes from './Routes/displayRoutes.js';
import updateReviewStatus from './Routes/updateReviewStatus.js';
import fetchAllActivitiesRoutes from './Routes/fetchAllActivitiesRoutes.js'; 
import editFormRoutes from './Routes/editFormRoutes.js';
import fileUpload from 'express-fileupload';
import dotenv from 'dotenv'; // For environment variables

dotenv.config(); // Load environment variables

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
  'https://jk2vw2qg-5000.inc1.devtunnels.ms/',
  'https://jk2vw2qg-5173.inc1.devtunnels.ms/',
  'https://jk2vw2qg-27017.inc1.devtunnels.ms/'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!allowedOrigins.includes(origin)) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));

// Middleware to log received files and body data
app.use((req, res, next) => {
  logger.info('Received files:', req.files);
  logger.info('Received body:', req.body);
  next();
});

// Serve Images
app.use('/images', express.static(path.join(__dirname, 'images')));
app.get('/images/:year/:imageName', (req, res) => {
  const { year, imageName } = req.params;
  const imagePath = path.join(process.cwd(), 'Images', year, imageName);
  logger.info('Full Image Path:', imagePath);

  if (fs.existsSync(imagePath)) {
    logger.info('Image exists.');
    res.sendFile(imagePath);
  } else {
    logger.warn('Image does not exist.');
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
      return res.status(500).json({ success: false, message: 'Database connection error: ' + err.message });
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
    res.status(500).json({ success: false, message: 'Error fetching branch: ' + err.message });
  }
}

// Register routes
app.use(fetchAllActivitiesRoutes);
app.get('/branch/:code', fetchBranchByCode);
app.use('/update-review-status', updateReviewStatus); 
app.use('/check-entry', checkEntryRoutes);
app.use('/submit-form', submitDataRoutes);
app.use(editFormRoutes);
app.use(displayRoutes);

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});
