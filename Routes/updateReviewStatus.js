import express from 'express';
const router = express.Router();

// Route to update the review status
router.post('/', async (req, res) => {
  const { branchCode, year, quarter, month } = req.body;

  try {
    const db = req.db;
    const logsCollection = db.collection('Logs');
    
    // Update the review status to 'Yes' where it is currently 'No'
    const updateResult = await logsCollection.updateOne(
      {
        Branch_Code: String(branchCode),
        Year: parseInt(year, 10),
        Qtr: quarter,
        Month: month,
        Review_Status: 'No'
      },
      {
        $set: { Review_Status: 'Yes' }
      }
    );

    if (updateResult.modifiedCount > 0) {
      res.json({ success: true, message: 'Review status updated to Yes' });
    } else {
      res.json({ success: false, message: 'No matching entry found or already updated' });
    }
  } catch (err) {
    console.error('Error updating review status:', err);
    res.status(500).json({ success: false, message: 'Error updating review status' });
  }
});

export default router;
