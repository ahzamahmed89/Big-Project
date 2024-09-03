import express from 'express';

const router = express.Router();

// Route to fetch activities based on branch code, year, and quarter
router.get('/fetch-activities', async (req, res) => {
    const { branchCode, year, quarter } = req.query;
    const collectionName = `PMSF_Collection_${year}`; // Create collection name dynamically
  
    try {
      const collection = req.db.collection(collectionName);
      const activities = await collection.find({
        Year: parseInt(year, 10),
        Qtr: quarter,
        Branch_Code: branchCode,
        Status: "No" // Filter by status "No"
    }).toArray();
  
      if (activities.length > 0) {
        res.json({ success: true, data: activities });
      } else {
        res.json({ success: false, message: 'No activities found for the specified criteria' });
      }
    } catch (err) {
      logger.error('Error fetching activities:', err);
      res.status(500).json({ success: false, message: 'An error occurred while fetching activities' });
    }
  });
  
export default router;
