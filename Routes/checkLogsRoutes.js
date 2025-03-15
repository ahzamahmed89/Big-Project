import express from 'express';
const router = express.Router();

router.get('/check-logs', async (req, res) => {
  try {
    const { year, quarter, month } = req.query;

    // Validate required parameters
    if (!month || !year || !quarter) {
      return res.status(400).json({ error: 'Month, year, and quarter are required.' });
    }

    const collection = req.db.collection('Logs');

    // Aggregation pipeline for "Physical" MS_Type
    const physicalPipeline = [
      {
        $match: {
          Month: month,
          Year: parseInt(year, 10),
          Qtr: quarter,
          Entry_Status: { $ne: 'Deleted' },
          MS_Type: "Physical"
        }
      },
      {
        $sort: { 
          Branch_Code: 1, 
          Last_Edit_Date: -1,
          Last_Edit_Time: -1 
        }
      },
      {
        $group: {
          _id: "$Branch_Code",
          mostRecentEntry: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$mostRecentEntry" }
      }
    ];

    // Execute the aggregation for "Physical" entries
    const physicalLogs = await collection.aggregate(physicalPipeline).toArray();

    // Get unique Branch_Code list from the first query result
    const branchCodes = physicalLogs.map(log => log.Branch_Code);

    // Aggregation pipeline for "Transaction" MS_Type for matched Branch_Codes
    const transactionPipeline = [
      {
        $match: {
          Branch_Code: { $in: branchCodes },
          Month: month,
          Year: parseInt(year, 10),
          Qtr: quarter,
          Entry_Status: { $ne: 'Deleted' },
          MS_Type: "Transaction"
        }
      },
      {
        $sort: {
          Branch_Code: 1,
          Last_Edit_Date: -1,
          Last_Edit_Time: -1
        }
      },
      {
        $group: {
          _id: "$Branch_Code",
          mostRecentEntry: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$mostRecentEntry" }
      }
    ];

    // Execute the aggregation for "Transaction" entries
    const transactionLogs = await collection.aggregate(transactionPipeline).toArray();

    // Create a map of transactionLogs by Branch_Code for quick lookup
    const transactionMap = new Map(transactionLogs.map(log => [log.Branch_Code, log]));

    // Add `hasTransaction` flag to each physical log and log matched entries
    const enhancedPhysicalLogs = physicalLogs.map(log => {
      const matchedTransaction = transactionMap.get(log.Branch_Code);
  const hasTransaction = !!matchedTransaction;
     
      
      return {
        ...log,
        hasTransaction,
        highlight: !hasTransaction, // Set `highlight` to true if no match is found
    matchedTransaction 
      };
    });
    enhancedPhysicalLogs.sort((a, b) => a.hasTransaction - b.hasTransaction);
    // Combine results
    const result = {
      physical: enhancedPhysicalLogs,    // Send modified physical logs with `hasTransaction` flag
      transaction: transactionLogs       // Send original transaction logs
    };

    res.status(200).json(result);

  } catch (error) {
    console.error('Error checking logs:', error);
    res.status(500).json({ error: 'An error occurred while checking logs.' });
  }
});

export default router;
