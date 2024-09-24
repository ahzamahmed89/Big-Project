import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define the base directory for storing images
const baseDir = path.join(process.cwd(), 'Images');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const year = req.body.data ? JSON.parse(req.body.data).Year : new Date().getFullYear();
    const dir = path.join(baseDir, `${year}`);  // Append year to the base directory
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });  // Create directory if it doesn't exist
    }
    cb(null, dir);  // Save the file in this directory
  },
  filename: function (req, file, cb) {
    const data = JSON.parse(req.body.data);
    const code = file.fieldname.split('-')[1];
    const activity = data.Activities.find(activity => activity.Code === code);
    
    if (!activity) {
      return cb(new Error(`No activity found with Code: ${code}`));
    }

    // Create unique filename
    const uniqueName = `${activity.Code}_${data.Branch_Code}_${data.Qtr}_${data.Year}${path.extname(file.originalname)}`;
    cb(null, uniqueName);  // Save file with the unique name
  }
});

// Full absolute file path saved to the database
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
}).any();  // Allow any file field names

export default upload;
