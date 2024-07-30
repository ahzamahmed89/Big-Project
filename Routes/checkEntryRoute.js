import express from 'express';
import winston from 'winston';
import { getDb } from '../Utils/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { branchCode, year, quarter, month } = req.query;

  try {
    const db = await getDb();
    const collection = db.collection('Logs');
    const pmsfCollection = db.collection('PMSF_Main_File');

    const query = {
      Branch_Code: branchCode,
      Year: parseInt(year, 10),
      Qtr: quarter,
      Month: month,
      Entry_Status: { $in: ['Enter', 'Authorize'] }
    };

    const options = { sort: { Last_Edit_Date: -1, Last_Edit_Time: -1 }, limit: 1 };

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

export default router;
