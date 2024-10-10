import express from 'express';
import winston from 'winston';
import path from 'path';

const router = express.Router();

router.put('/update', async (req, res) => {
  try {
    if (!req.body.data) {
      throw new Error('Missing data in the request');
    }

    const parsedData = JSON.parse(req.body.data);
    const { Branch_Code, Year, Qtr, Activities, Visited_By, Reviewed_By_OM_BM } = parsedData;

    if (!Branch_Code || !Year || !Qtr || !Activities) {
      throw new Error('Missing required fields for update');
    }

    const collectionName = `PMSF_Collection_${Year}`;
    const collection = req.db.collection(collectionName);

    // Update each activity in the Activities array
    for (const activity of Activities) {
      const file = req.files?.find(f => {
        const [fileCode] = f.filename.split('_');
        return fileCode === activity.Code;
      });

      const year = Year.toString(); // Convert Year to string
      const filePath = file ? path.join(process.cwd(), 'Images', year, file.filename) : null;

      // Update the activity in the collection
      await collection.updateOne(
        { Branch_Code, 'Activities.Code': activity.Code, Year, Qtr },
        {
          $set: {
            'Activities.$.Status': activity.Status,
            'Activities.$.Responsibility': activity.Responsibility,
            'Activities.$.Remarks': activity.Remarks,
            'Activities.$.Images': filePath || activity.Images,  // Update image if new file uploaded, otherwise keep existing
          }
        }
      );
    }

    // Insert log entry for the edit
    const logCollection = req.db.collection('Logs');
    const currentDate = new Date();
    const logEntry = {
      Branch_Code,
      Year,
      Qtr,
      Entry_Status: 'Edit',
      Last_Edit_By: Visited_By,
      Last_Edit_Date: currentDate.toLocaleDateString('en-US'),
      Last_Edit_Time: currentDate.toLocaleTimeString('en-US'),
      Reviewer_Name: Reviewed_By_OM_BM,
      Review_Status: 'Pending',
    };

    await logCollection.insertOne(logEntry);

    res.json({ success: true, message: 'Data successfully updated' });
  } catch (err) {
    winston.error('Error in /update route:', err);
    res.status(500).json({ success: false, message: 'Error updating data', error: err.message });
  }
});

export default router;
