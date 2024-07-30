import express from 'express';
const router = express.Router();
import winston from 'winston';

router.post('/', async (req, res) => {
  try {
    if (!req.body.data) {
      throw new Error('Missing data in the request');
    }

    const parsedData = JSON.parse(req.body.data);
    const { Branch_Code, Branch_Name, Region_Name, Quarter, Month, Year, Visited_By, Visit_Date, Visit_Time, Reviewed_By_OM_BM, Activities } = parsedData;

    if (!Branch_Code || !Branch_Name || !Region_Name || !Quarter || !Month || !Year || !Visited_By || !Visit_Date || !Visit_Time || !Reviewed_By_OM_BM || !Activities) {
      throw new Error('Missing required fields in the request body');
    }

    const collectionName = `PMSF_Collection_${Year}`;
    const collection = req.db.collection(collectionName);

    const newEntries = Activities.map(activity => {
      const file = req.files ? req.files.find(file => file.originalname.includes(activity.Code)) : null;
      return {
        ...activity,
        Branch_Code,
        Branch_Name,
        Region_Name,
        Qtr: Quarter,
        Month,
        Year,
        Visited_By,
        Visit_Date,
        Visit_Time,
        Reviewed_By_OM_BM,
        Images: file ? file.path : null
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
      Qtr: Quarter,
      Month,
      Entry_Status: 'Enter',
      Last_Edit_By: Visited_By,
      Last_Edit_Date: currentDate.toLocaleDateString('en-US'),
      Last_Edit_Time: currentDate.toLocaleTimeString('en-US'),
      Reviewer_Name: Reviewed_By_OM_BM,
      Review_Status: 'Yes'
    };

    await logCollection.insertOne(logEntry);

    res.json({ success: true, message: 'Data successfully submitted and stored', insertedCount: newEntries.length });
  } catch (err) {
    winston.error('Error in /submit-form:', err);
    res.status(500).json({ success: false, message: 'Error inserting data', error: err.message });
  }
});

export default router;