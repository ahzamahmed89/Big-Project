import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Helper function to delete an image from the filesystem
const deleteImageFromFileSystem = (imagePath) => {
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath); // Deletes the file from the file system
  }
};

router.post('/submit-edit', async (req, res) => {
  try {
    const { branchCode, branchName, regionName, month, year, quarter, visitDate, visitedBy, reviewedBy, visitTime } = req.body;
    const activities = JSON.parse(req.body.activities);

    // Basic validation
    if (!branchCode || !year || !quarter || !activities) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const collectionName = `PMSF_Collection_${year}`;
    const db = req.db;
    const collection = db.collection(collectionName);

    // Loop through each activity and update fields
    await Promise.all(
      activities.map(async (activity) => {
        const query = {
          Branch_Code: branchCode,
          Year: parseInt(year, 10),
          Qtr: quarter,
          Code: activity.Code, // Ensure we are matching the activity based on code
        };

        // Get the existing activity from the database
        const existingActivity = await collection.findOne(query);

        if (!existingActivity) {
          return; // Exit early if the activity is not found
        }

        // Build the updated activity object
        const activityUpdate = {
          Visited_By: visitedBy,
          Visit_Date: visitDate,
          Visit_Time: visitTime,
          Reviewed_By_OM_BM: reviewedBy,
          Images: existingActivity.Images, // Preserve existing image path unless modified
        };

        // Update only if the field has been provided and is not empty
        if (activity.Status !== undefined && activity.Status !== null) {
          activityUpdate.Status = activity.Status;
        }

        if (activity.Responsibility !== undefined && activity.Responsibility !== null) {
          activityUpdate.Responsibility = activity.Responsibility;
        }

        if (activity.Remarks !== undefined && activity.Remarks !== null) {
          activityUpdate.Remarks = activity.Remarks;
        }

        // Handle Image Logic
       

        const file = req.files?.[`Images-${activity.Code}`];
        if (file) {
          const imageName = `${activity.Code}_${branchCode}_${quarter}_${year}.jpg`; // Naming based on code, branch, quarter, year

          // Ensure the directory exists before saving the file
          const imagesDir = path.join(process.cwd(), 'Images', year.toString());
          if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true }); // Create the directory if it doesn't exist
            console.log(`Created directory: ${imagesDir}`);
          }

          const imagePath = path.join(imagesDir, imageName);
         
          

          try {
            await file.mv(imagePath); // Save the file to the file system
            activityUpdate.Images = imagePath; // Update image path in the activity
           
            
          } catch (err) {
            console.error(`Error while saving file: ${err}`);
          }
        } else if (!activity.Images && existingActivity?.Images) {
          // If the image is removed, delete the existing image
          const existingImagePath = existingActivity.Images;
         
          
          deleteImageFromFileSystem(existingImagePath); // Delete from the file system
          activityUpdate.Images = null; // Remove image reference in the database
        }

        // Perform the update in MongoDB
        const updateResult = await collection.updateOne(query, { $set: activityUpdate });
        if (updateResult.modifiedCount > 0) {
         
          
        } else {
          console.log(`No update made for Code: ${activity.Code}`);
        }
      })
    );

    // After successful update, insert a log entry
    const logCollection = db.collection('Logs');
    const currentDate = new Date();
    const logEntry = {
      Branch_Code: branchCode,
      Branch_Name: branchName,
      Region_Name: regionName,
      Year: parseInt(year, 10),
      Qtr: quarter,
      Month: month,  // Assuming Month is extracted from Visit_Date
      Entry_Status: 'Update',  // Status set to 'Update' for edit submission
      Last_Edit_By: visitedBy,
      Last_Edit_Date: currentDate.toISOString().split('T')[0],  // YYYY-MM-DD
  Last_Edit_Time: currentDate.toISOString().split('T')[1].split('.')[0],
      Reviewer_Name: reviewedBy,
      Review_Status: 'No',  // Initial review status
      SnQ_Reviewer: '',
      SnQ_Review_Status: 'No',
    };

    await logCollection.insertOne(logEntry);

    console.log('All activities successfully updated');
    return res.json({ success: true, message: 'Data successfully updated and log entry created' });
  } catch (error) {
    console.error('Error in /submit-edit route:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
  }
});

// Route to create new data if the user opts to do so
router.post('/create-new-entry', async (req, res) => {
  await handleDataSubmission(req, res, true);
});

export default router;
