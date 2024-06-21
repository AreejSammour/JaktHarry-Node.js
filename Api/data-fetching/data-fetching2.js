import axios from 'axios';
import cheerio from 'cheerio';
import { db } from '../db.js';
import util from 'util';
import { urlConfig } from './urlConfig.js';
import getText2 from './get-text2.js';
import selectRandomImage from './fetch-image.js';

const queryAsync = util.promisify(db.query).bind(db);

const fetchAndSaveNews2 = async (urlKey) => {
  let existingPost = null; // Initialize existingPost outside the try block
  try {
    const response = await axios.get(urlConfig[urlKey]);
    const $ = cheerio.load(response.data);

    const news_data = [];

    const news = $('section .page .entry ul');
    const category = urlKey.replace(/Url$/, ''); // Remove "Url" from the end of the urlKey

    for (let i = 0; i < 15; i++) {
      const listItem =  $(news).find('li').eq(i);
      const link = listItem.find('a').attr('href');

      // Call the getText function to extract intro and text
      let { heading, text, intro, NDate, urlImg } = await getText2(link);
      if (urlImg = "" || !urlImg){
        urlImg = await selectRandomImage();
      }
      const fkuid = 1; // admin id
    
      // Check if a post with the same title and description already exists
      existingPost = await queryAsync("SELECT * FROM posts WHERE `title` = ? AND `desc` = ?", [heading, intro]);

      if (existingPost && existingPost.length > 0) {
        console.log(`Post already exists. Skipping...`);
      } else {
        // Save the data to the database
        const insertQuery = "INSERT INTO posts (`title`, `desc`, `date`, `text`, `cat`, `img`, `uid`) VALUES (?)";
        const values = [heading, intro, NDate, text, category, urlImg, fkuid];
        await queryAsync(insertQuery, [values]);
        news_data.push({ heading, intro, NDate, text, category, urlImg, fkuid });
      }
    }

  } catch (error) {
    console.error('Error fetching or saving news data:', error.message);
    console.error(error.stack); 
  }
}

export default fetchAndSaveNews2;