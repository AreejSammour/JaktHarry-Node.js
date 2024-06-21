import express  from "express";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import moderatorRoutes from "./routes/moderators.js";
import { db } from "./db.js";
import cookieParser from "cookie-parser";
import multer from "multer";
import cors from "cors";
import fetchDataAndSave from './data-fetching/data-fetching.js';
import fetchDataAndSave2 from './data-fetching/data-fetching2.js';
import dataFetchingRimbo from './data-fetching/dataFetchingRimbo.js';
import dataFetchingSCA from './data-fetching/dataFetchingSCA.js';

import cron from 'node-cron';

const app = express()
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: true,
  credentials: true
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin',  'http://localhost:3000' , 'https://'); // Allow all origins (replace with specific origins if needed)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../client/public/upload');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
})

const upload = multer({ storage });

app.post('/api/upload', upload.single('file'), function (req, res) {
  const file = req.file;
  res.status(200).json(file.filename);
})

// Routes for authentication, users, and posts
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/moderators", moderatorRoutes);

// Define a route to trigger the fetchAndSaveNews function immediately
app.get('/fetch-now', async (req, res) => {
  try {
    //Fetch data and save it to the database immediately for testing
    await fetchDataAndSave('riksUrl');
    await fetchDataAndSave('lansUrl');
    await fetchDataAndSave('nationellUrl');
    await fetchDataAndSave('JAQTUrl');
    await fetchDataAndSave2('StockholmCentralaUrl');
    await dataFetchingRimbo('Rimbo');
    await dataFetchingSCA('SCA');

    res.send('Fetching and saving data now. Check the console for logs.');
  } catch (error) {
    console.error('Error fetching or saving news data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/', (req, res) => {
  res.send('Hello, this is your Express app!');
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
  } else {
    cron.schedule('0 0,12 * * *', async () => {
      try {
        await fetchDataAndSave('riksUrl');
        await fetchDataAndSave('lansUrl');
        await fetchDataAndSave('nationellUrl');
        await fetchDataAndSave('JAQTUrl');
        console.log('Data fetched and saved successfully.');
      } catch (error) {
        console.error('Error fetching or saving news data:', error.message);
      }
    });

    cron.schedule('0 6,18 * * *', async () => {
      try {
        await fetchDataAndSave2('StockholmCentralaUrl');
        await dataFetchingRimbo('Rimbo');
        await dataFetchingSCA('SCA');
        console.log('Data fetched and saved for 6 AM/PM.');
      } catch (error) {
        console.error('Error fetching or saving data for 6 AM/PM:', error.message);
      }
    });

    const PORT = process.env.PORT || 6969;
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  }
});
