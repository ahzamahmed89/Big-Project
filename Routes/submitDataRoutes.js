import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Helper function to delete an image from the filesystem
const deleteImageFromFileSystem = (imagePath) => {
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
};

router.post('/', async (req, res) => {
  try {
    const { branchCode, branchName, regionName,Entry_Status, month, year, quarter, visitDate, visitedBy, reviewedBy, MS_Type, visitTime, snqrev } = req.body;
    const activities = JSON.parse(req.body.activities);

    // Basic validation
    if (!branchCode || !year || !quarter || !activities) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const collectionName = `PMSF_Collection_${year}`;
    const db = req.db;
    const collection = db.collection(collectionName);

    // Loop through each activity and insert or update fields
    await Promise.all(
      activities.map(async (activity) => {
        const query = {
          Branch_Code: branchCode,
          Year: parseInt(year, 10),
          Qtr: quarter,
          Code: activity.Code,
        };

        // Check for existing activity
        const existingActivity = await collection.findOne(query);

        const activityData = {
          Branch_Code: branchCode,
          Branch_Name: branchName,
          Region_Name: regionName,
          Year: parseInt(year, 10),
          Qtr: quarter,
          Month: month,
          Code: activity.Code,
          Visited_By: visitedBy,
          Visit_Date: visitDate,
          Visit_Time: visitTime,
          Reviewed_By_OM_BM: reviewedBy,
          
          Status: activity.Status || null,
          Responsibility: activity.Responsibility || null,
          Remarks: activity.Remarks || null,
          Weightage: activity.Weightage ,
          Activity: activity.Activity ,
          Category: activity.Category ,
          Seq: activity.Seq,
          Images: existingActivity ? existingActivity.Images : null, // Preserve existing image path unless modified
        };

        // Handle image upload if provided
        const file = req.files?.[`Images-${activity.Code}`];
        if (file) {
          const imageName = `${activity.Code}_${branchCode}_${quarter}_${year}.jpg`;
          const imagesDir = path.join(process.cwd(), 'Images', year.toString());
          if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
          }
          const imagePath = path.join(imagesDir, imageName);
          await file.mv(imagePath);
          activityData.Images = imagePath;
        } else if (!activity.Images && existingActivity?.Images) {
          // Remove existing image if not included in the update
          const existingImagePath = existingActivity.Images;
          deleteImageFromFileSystem(existingImagePath);
          activityData.Images = null;
        }

        // Insert or update activity
        if (existingActivity) {
          await collection.updateOne(query, { $set: activityData });
        } else {
          await collection.insertOne(activityData);
        }
      })
    );

    // Log entry after successful update or insert
    const logCollection = db.collection('Logs');
    const currentDate = new Date();
    let reviewstatus;
   
    if (snqrev !==""){
      reviewstatus="Yes"
    }else{
     reviewstatus="No"
    }
    const logEntry = {
      Branch_Code: branchCode,
      Branch_Name: branchName,
      Region_Name: regionName,
      Year: parseInt(year, 10),
      Qtr: quarter,
      Month: month,
      Entry_Status: Entry_Status,
      MS_Type: MS_Type,
      Last_Edit_By: visitedBy,
      Last_Edit_Date: currentDate.toISOString().split('T')[0],
      Last_Edit_Time: currentDate.toISOString().split('T')[1].split('.')[0],
      Reviewer_Name: reviewedBy,
      Review_Status: 'No',
      SnQ_Reviewer: snqrev,
      SnQ_Review_Status: reviewstatus,
    };

    await logCollection.insertOne(logEntry);

    console.log('Activities successfully updated or created');
    return res.json({ success: true, message: 'Data successfully updated or created and log entry created' });
  } catch (error) {
    console.error('Error in /submit-edit route:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
  }
});

export default router;
