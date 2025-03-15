 
  import express from 'express';
  const router = express.Router();
  import { MongoClient } from 'mongodb';

  router.get('/transaction-feedback', async (req, res) => {
    
    const { branchCode } = req.query;

    try {
      const collection = req.db.collection('TrEntry_Main_File');
    
      // Try to fetch data using the Branch_Code
      const feedbackData = await collection.findOne({ Branch_Code: branchCode });
      console.log('Feedback data for branch code:', branchCode, feedbackData);
    
      if (feedbackData) {
        // If data for the branchCode is found, return it
        res.status(200).json(feedbackData);
      } else {
        // If no data is found for the branchCode, fetch the first available data
        const fallbackData = await collection.find({}).toArray();
        console.log('Fallback data (no matching branch code):', JSON.stringify(fallbackData, null, 2));

    
        if (fallbackData) {
          res.status(200).json(fallbackData);
        } else {
          // If no data is available at all
          console.log('No data available in the collection.');
          res.status(404).json({ message: 'No feedback data available' });
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
    
    
  });

  export default router;
