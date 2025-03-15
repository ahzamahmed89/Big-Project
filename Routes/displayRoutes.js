import express from 'express';
const router = express.Router();

// Route to fetch activities based on branch code, year, and quarter
router.get('/fetch-activities', async (req, res) => {
  const { branchCode, year, quarter } = req.query;
  const collectionName = `PMSF_Collection_${year}`; // Create collection name dynamically

  try {
    const db = req.db;
    const collection = db.collection(collectionName);

    // Fetch current quarter data
    const activities = await collection.find({
      Year: parseInt(year, 10),
      Qtr: quarter,
      Branch_Code: branchCode,
      Status: "No" // Filter by status "No"
    }).toArray();

    // If current quarter data is found, fetch previous quarter data
    if (activities.length > 0) {
     
      // Logic to fetch previous quarter data
      const previousQuarter = (parseInt(quarter.charAt(1)) - 1) || 4;
      const previousYear = previousQuarter === 4 ? year - 1 : year;
      const previousCollectionName = `PMSF_Collection_${previousYear}`;

      const previousCollection = db.collection(previousCollectionName);
      
      const previousQuarterQuery = {
        Branch_Code: String(branchCode),
        Qtr: `Q${previousQuarter}`,
        Year: parseInt(previousYear, 10)
      };

      const previousQuarterData = await previousCollection.find(previousQuarterQuery).toArray();

         // Combine current and previous quarter data
      const processedDocs = activities.map(currentDoc => {
        // Match current quarter docs with previous quarter based on Code
        
        const previousDoc = previousQuarterData.find(prev => {
          return String(prev.Code) === String(currentDoc.Code);
        });

        return {
          Code: currentDoc.Code,
          Category: currentDoc.Category,
          Activity: currentDoc.Activity,
          Weightage: currentDoc.Weightage ? currentDoc.Weightage.toString() : null,
          Status: currentDoc.Status,
          seq: currentDoc.seq,
          Images: currentDoc.Images,
          Month: currentDoc.Month,
          Visited_By: currentDoc.Visited_By,
          Reviewed_By_OM_BM: currentDoc.Reviewed_By_OM_BM,
          Visit_Date: currentDoc.Visit_Date,
          Remarks: currentDoc.Remarks,
          Responsibility:currentDoc.Responsibility,
          PreviousQuarterData: previousDoc ? {
            Status: previousDoc.Status,
            Responsibility: previousDoc.Responsibility,
            Remarks: previousDoc.Remarks,
            Images: previousDoc.Images
          } : null
        };
        
      });
      
      // Return the current quarter data with previous quarter data (if available)
      return res.json({ success: true, data: processedDocs });
      
    }

    // If no current quarter data is found, return a failure message
    return res.json({ success: false, message: 'No activities found for the current quarter.' });

  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ success: false, message: 'An error occurred while fetching activities' });
  }
});

export default router;
