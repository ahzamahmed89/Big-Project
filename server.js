import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import winston from 'winston';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

// Import your route handler
import checkEntryRoutes from './Routes/checkEntryRoute.js'; // Adjust the path accordingly

const app = express();
const PORT = process.env.PORT || 5000;
const dbName = 'PMSF';
const url = 'mongodb+srv://ahmedahxam:1234@cluster0.3fs3r1f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(url);

const allowedOrigins = ['http://127.0.0.1:5173', 'http://localhost:5173', 'https://rhsk3l6j-5173.inc1.devtunnels.ms'];
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

app.use((req, res, next) => {
  const origin = req.get('Origin'); // Get the origin of the request
  const port = req.get('Host'); // Get the host (which includes the port)
  const ip = req.ip; // Get the IP address of the client
  
  console.log(`Origin: ${origin}`);
  console.log(`Host (Port): ${port}`);
  console.log(`IP Address: ${ip}`);
  
  next(); // Continue to the next middleware or route
});

app.use(express.json({ limit: '50mb' }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const year = req.body.data ? JSON.parse(req.body.data).Year : new Date().getFullYear();
    const dir = path.join(process.cwd(), 'Images', `${year}`);
    console.log(`Checking directory: ${dir}`);
    if (!fs.existsSync(dir)) {
      console.log(`Directory does not exist. Creating: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const data = JSON.parse(req.body.data);
    const activity = data.Activities.find(activity => file.originalname.includes(activity.Code));
    const uniqueName = `${activity.Code}_${data.Branch_Code}_${data.Qtr}_${data.Year}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

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

async function mongoMiddleware(req, res, next) {
  try {
    const db = await client.connect();
    req.db = db.db(dbName);
    next();
  } catch (err) {
    winston.error('Database connection error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

app.use(mongoMiddleware);

// Reusable function to handle branch code lookups
async function fetchBranchByCode(req, res) {
  const branchCode = req.params.code;
  console.log('Received branch code:', branchCode);

  try {
    const collection = req.db.collection('Branches');
    const branch = await collection.findOne({ 'Branch_Code': branchCode });

    console.log('Branch found:', branch);
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
    winston.error('Error in /branch/:code:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// Use the fetchBranchByCode function for branch route handler
app.get('/branch/:code', fetchBranchByCode);

// Use the imported routes for /check-entry, where /submit-form logic now resides
app.use('/check-entry', checkEntryRoutes);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
