import express from 'express';
import winston from 'winston';
import path from 'path';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    if (!req.body.data) {
      throw new Error('Missing data in the request');
    }

    const parsedData = JSON.parse(req.body.data);
    const { Branch_Code, Branch_Name, Region_Name, Qtr, Month, Year, Visited_By, Visit_Date, Visit_Time, Reviewed_By_OM_BM, Activities } = parsedData;

    if (!Branch_Code || !Branch_Name || !Region_Name || !Qtr || !Month || !Year || !Visited_By || !Visit_Date || !Visit_Time || !Reviewed_By_OM_BM || !Activities) {
      throw new Error('Missing required fields in the request body');
    }

    const collectionName = `PMSF_Collection_${Year}`;
    const collection = req.db.collection(collectionName);

    const newEntries = Activities.map(activity => {
      // Match the file to the specific activity code
      const file = req.files.find(f => {
          const [fileCode] = f.filename.split('_'); // Extract the code from the file name
          return fileCode === activity.Code; // Ensure an exact match
      });
  
      const filePath = file ? file.filename : null;
  
    
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
          Images: filePath, // Save the correct file path to the Images field
      };
  });
  
  // Insert the new entries into the database
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
      Review_Status: 'No',
      SnQ_Reviewer: '',
      SnQ_Review_Status: 'No',
    };

    await logCollection.insertOne(logEntry);

    res.json({ success: true, message: 'Data successfully submitted and stored', insertedCount: newEntries.length });
  } catch (err) {
    winston.error('Error in /submit-form:', err);
    res.status(500).json({ success: false, message: 'Error inserting data', error: err.message });
  }
});


export default router;
