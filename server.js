import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import logger from './Utils/logger.js'; 

import submitDataRoutes from './Routes/submitDataRoutes.js';
import checkEntryRoutes from './Routes/checkEntryRoute.js';
import displayRoutes from './Routes/displayRoutes.js';
import updateReviewStatus from './Routes/updateReviewStatus.js';
import fetchAllActivitiesRoutes from './Routes/fetchAllActivitiesRoutes.js'; 
import checkLogsRoutes from './Routes/checkLogsRoutes.js';
import fileUpload from 'express-fileupload';
import TrForm from './Routes/trForm.js';
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



// CORS setup
const allowedOrigins = [
  'http://127.0.0.1:5173',
  'http://localhost:5176',
  'http://localhost:5174',
  'https://jk2vw2qg-5000.inc1.devtunnels.ms/',
  'https://jk2vw2qg-5173.inc1.devtunnels.ms/',
  'https://jk2vw2qg-27017.inc1.devtunnels.ms/'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      // Allow requests with no origin, such as mobile apps or curl requests
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'],   // Allow these headers
  credentials: true                                    // Allow cookies and credentials
}));
app.options('*', cors());

app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));

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
app.use(checkLogsRoutes);
app.use(displayRoutes);
app.use(TrForm);
app.listen(PORT,'0.0.0.0', () => {
  logger.info(`Server started on port ${PORT}`);
});
