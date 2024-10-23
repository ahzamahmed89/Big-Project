import express from 'express';
import winston from 'winston';
import path from 'path';

const router = express.Router();

// Function to handle both new entry and update logic
async function handleDataSubmission(req, res, createNew = false) {
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
      const file = req.files.find(f => {
        const [fileCode] = f.filename.split('_');
        return fileCode === activity.Code;
      });

      const year = Year.toString();
      const filePath = file ? path.join(process.cwd(), 'Images', year, file.filename) : null;

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
        Images: filePath,
      };
    });

    if (createNew) {
      await collection.insertMany(newEntries); // Create new entries
    } else {
      // Logic to update existing entries goes here
      // For example, using `updateMany` or `updateOne` depending on the need
    }

    const logCollection = req.db.collection('Logs');
    const currentDate = new Date();
    const logEntry = {
      Branch_Code,
      Branch_Name,
      Region_Name,
      Year,
      Qtr,
      Month,
      Entry_Status: createNew ? 'Enter' : 'Update',
      Last_Edit_By: Visited_By,
      Last_Edit_Date: currentDate.toISOString().split('T')[0],
      Last_Edit_Time: currentDate.toISOString().split('T')[1].split('.')[0],
      Reviewer_Name: Reviewed_By_OM_BM,
      Review_Status: 'No',
      SnQ_Reviewer: '',
      SnQ_Review_Status: 'No',
    };

    await logCollection.insertOne(logEntry);

    res.json({ success: true, message: createNew ? 'New entry successfully created' : 'Data successfully updated', insertedCount: newEntries.length });
  } catch (err) {
    winston.error('Error in /submit-form:', err);
    res.status(500).json({ success: false, message: 'Error inserting data', error: err.message });
  }
}

// POST route for form submission (either create or update)
router.post('/', async (req, res) => {
  // Call the common logic with createNew = false for updates
  await handleDataSubmission(req, res, false);
});

export { handleDataSubmission };
export default router;
