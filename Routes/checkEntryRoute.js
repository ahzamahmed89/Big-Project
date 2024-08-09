import express from 'express';
const router = express.Router();

router.get('/', async (req, res) => {
  const { branchCode, year, quarter, month } = req.query;

  try {
    const db = req.db;
    const logsCollection = db.collection('Logs');
    const mainFileCollection = db.collection('PMSF_Main_File');

    console.log(`Received request with parameters: Branch_Code: ${branchCode}, Year: ${year}, Quarter: ${quarter}, Month: ${month}`);

    const query = {
      Branch_Code: String(branchCode), // Ensure Branch_Code is treated as a string
      Year: parseInt(year, 10),
      Qtr: quarter,
      Month: month,
      Entry_Status: { $in: ['Enter', 'Authorize'] }
    };

    const options = { sort: { Last_Edit_Date: -1, Last_Edit_Time: -1 }, limit: 1 };

    const logs = await logsCollection.find(query, options).toArray();

    console.log(`Logs found: ${logs.length}`);

    if (logs.length > 0) {
      
      res.json({
        success: true,
        message: `Branch entry already done by ${logs[0].Last_Edit_By} on ${logs[0].Last_Edit_Date} at ${logs[0].Last_Edit_Time}`
      });
    } else {
      const previousQuarter = (parseInt(quarter.charAt(1)) - 1) || 4;
      const previousYear = previousQuarter === 4 ? year - 1 : year;

      const previousCollectionName = `PMSF_Collection_${previousYear}`;
      const previousCollection = db.collection(previousCollectionName);
      const previousQuarterQuery = {
        Branch_Code: String(branchCode), // Ensure Branch_Code is treated as a string
        Qtr: `Q${previousQuarter}`,
        Year: parseInt(previousYear, 10)
      };

      console.log(`Querying previous quarter data in collection '${previousCollectionName}' with: Branch_Code: ${branchCode}, Qtr: Q${previousQuarter}, Year: ${previousYear}`);

      const previousQuarterData = await previousCollection.find(previousQuarterQuery).toArray();

      console.log(`Found ${previousQuarterData.length} records in the previous quarter collection.`);

      const currentPmsfDocs = await mainFileCollection.find({}, { projection: { Code: 1, Category: 1, Activity: 1, Weightage: 1, Status: 1 } }).toArray();

      const processedDocs = currentPmsfDocs.map(currentDoc => {
        const previousDoc = previousQuarterData.find(prev => {
          const isMatch = String(prev.Code) === String(currentDoc.Code) && String(prev.Branch_Code) === String(branchCode);
                    return isMatch;
        });

        
        return {
          Code: currentDoc.Code,
          Category: currentDoc.Category,
          Activity: currentDoc.Activity,
          Weightage: currentDoc.Weightage ? currentDoc.Weightage.toString() : null,
          Status: currentDoc.Status,
          PreviousQuarterData: previousDoc ? {
            Status: previousDoc.Status,
            Responsibility: previousDoc.Responsibility,
            Remarks: previousDoc.Remarks,
            Images: previousDoc.Images
          } : null
        };
      });

     

      res.json({
        success: false,
        data: processedDocs
      });
    }
  } catch (err) {
    console.error('Error in /check-entry:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
