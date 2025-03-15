import express from 'express';

const router = express.Router();

router.get('/:code', async (req, res) => {
  const branchCode = req.params.code;


  try {
    const collection = req.db.collection('Branches');
    const branch = await collection.findOne({ 'Branch_Code': branchCode });

  
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

export default router;
