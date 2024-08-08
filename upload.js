import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define the base directory for storing images
const baseDir = 'C:\\Users\\User\\Desktop\\Big Project - Copy\\BigProject\\public\\Images';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const year = req.body.data ? JSON.parse(req.body.data).Year : new Date().getFullYear();
    const dir = path.join(baseDir, `${year}`);

    console.log(`Checking directory: ${dir}`);

    if (!fs.existsSync(dir)) {
      console.log(`Directory does not exist. Creating: ${dir}`);
      fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) {
          console.error(`Error creating directory: ${err}`);
          return cb(err);
        }
        cb(null, dir);
      });
    } else {
      cb(null, dir);
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

export default upload;
