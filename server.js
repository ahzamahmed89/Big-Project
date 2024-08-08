import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import winston from 'winston';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

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

app.get('/', (req, res) => {
  res.send('Welcome to the PMSF API');
});

app.get('/check-entry', async (req, res) => {
  const { branchCode, year, quarter, month } = req.query;
  const collection = req.db.collection('Logs');
  const pmsfCollection = req.db.collection('PMSF_Main_File');

  const query = {
    Branch_Code: branchCode,
    Year: parseInt(year, 10),
    Qtr: quarter,
    Month: month,
    Entry_Status: { $in: ['Enter', 'Authorize'] }
  };

  const options = { sort: { Last_Edit_Date: -1, Last_Edit_Time: -1 }, limit: 1 };

  try {
    const logs = await collection.find(query, options).toArray();
    if (logs.length > 0) {
      res.json({
        success: true,
        message: `Branch entry already done by ${logs[0].Last_Edit_By} on ${logs[0].Last_Edit_Date} at ${logs[0].Last_Edit_Time}`
      });
    } else {
      const pmsfDocs = await pmsfCollection.find({}, { projection: { Code: 1, Category: 1, Activity: 1, Weightage: 1, Status: 1 } }).toArray();

      const processedDocs = pmsfDocs.map(doc => ({
        Code: doc.Code,
        Category: doc.Category,
        Activity: doc.Activity,
        Weightage: doc.Weightage ? doc.Weightage.toString() : null,
        Status: doc.Status
      }));

      res.json({
        success: false,
        data: processedDocs
      });
    }
  } catch (err) {
    winston.error('Error in /check-entry:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.get('/branch/:code', async (req, res) => {
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
});

app.post('/submit-form', upload.array('images'), async (req, res) => {
  try {
    if (!req.body.data) {
      throw new Error('Missing data in the request');
    }
    let parsedData;
    try {
      parsedData = JSON.parse(req.body.data);
    } catch (e) {
      throw new Error('Invalid JSON in the request body');
    }

    const { Branch_Code, Branch_Name, Region_Name, Qtr, Month, Year, Visited_By, Visit_Date, Visit_Time, Reviewed_By_OM_BM, Activities } = parsedData;

    if (!Branch_Code || !Branch_Name || !Region_Name || !Qtr || !Month || !Year || !Visited_By || !Visit_Date || !Visit_Time || !Reviewed_By_OM_BM || !Activities) {
      throw new Error('Missing required fields in the request body');
    }

    const collectionName = `PMSF_Collection_${Year}`;
    const collection = req.db.collection(collectionName);

    const newEntries = Activities.map(activity => {
      const file = req.files ? req.files.find(file => file.originalname.includes(activity.Code)) : null;
      const imagePath = file ? file.path : null;
      
      // Log the final path used to store the image
      if (imagePath) {
        console.log(`Image stored at: ${imagePath}`);
      } else {
        console.log(`No image found for activity code: ${activity.Code}`);
      }

      return {
        ...activity,
        Branch_Code,
        Branch_Name,
        Region_Name,
        Qtr,
        Month,
        Year,
        Visited_By,
        Visit_Date,
        Visit_Time,
        Reviewed_By_OM_BM,
        Images: imagePath
      };
    });

    await collection.insertMany(newEntries);

    const logCollection = req.db.collection('Logs');
    const currentDate = new Date();
    const logEntry = {
      Branch_Code,
      Branch_Name,
      Region_Name,
      Year,
      Qtr,
      Month,
      Entry_Status: 'Enter',
      Last_Edit_By: Visited_By,
      Last_Edit_Date: currentDate.toLocaleDateString('en-US'),
      Last_Edit_Time: currentDate.toLocaleTimeString('en-US'),
      Reviewer_Name: Reviewed_By_OM_BM,
      Review_Status: 'Yes'
    };

    await logCollection.insertOne(logEntry);

    // Include the image paths in the response
    const imagePaths = req.files ? req.files.map(file => file.path) : [];

    res.json({ 
      success: true, 
      message: 'Data successfully submitted and stored', 
      insertedCount: newEntries.length,
      imagePaths: imagePaths
    });
  } catch (err) {
    winston.error('Error in /submit-form:', err);
    res.status(500).json({ success: false, message: 'Error inserting data', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
