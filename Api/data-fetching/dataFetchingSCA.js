import axios from 'axios';
import cheerio from 'cheerio';
import { db } from '../db.js';
import util from 'util';
import { urlConfig } from './urlConfig.js';
import selectRandomImage from './fetch-image.js';
import getOpenText from './getOpenText.js';

const queryAsync = util.promisify(db.query).bind(db);

const dataFetchingSCA = async (urlKey) => {
  
  try {

    let heading = "";
    let text = "";
    let intro = "";
    let NDate = "";
    

    const response = await axios.get(urlConfig[urlKey]);
    const $ = cheerio.load(response.data);

    const newsItems = $('div.l-inner div.media.news-item');
    const category = "open";
    const news_data = [];

    newsItems.each(async function(index, newsItem) {
      let heading = $(newsItem).find('div.media-body > h2[itemprop="headline"]').first().text().trim();

      //const NDate= $(newsItem).find('div.media-body span.news-item__date[itemprop="datePublished"]').text().trim();
      const NDateText = $(newsItem).find('div.media-body span.news-item__date[itemprop="datePublished"]').text().trim();
      const dateObject = new Date(NDateText);
      NDate = dateObject.toISOString().slice(0, 19).replace('T', ' ');

      let intro = $(newsItem).find('div.media-body p[itemprop="articleBody"]').first().text();
      let finalDotIndex = intro.lastIndexOf('.');
      if (finalDotIndex !== -1) {
        intro = intro.substring(0, finalDotIndex + 1);
      }

      const link = $(newsItem).find('div.media-body a[itemprop="url"]').attr('href');

      const { text } = await getOpenText(link);
      
      let existingPost = null;

      let urlImg = "";
      const urlImgElement = $(newsItem).find("div.media-img img");
      if (urlImgElement.length > 0) {
        urlImg = "https:///" + urlImgElement.attr('src');
      } else {
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
    })

  } catch (error) {
   console.error('Error fetching or saving news data:', error.message);
    console.error(error.stack); 
  }
}

function getFormattedTimestamp(newsItem) {
  const rawDate = $(newsItem).find('div.media-body span.news-item__date[itemprop="datePublished"]').text().trim();

  // Check if the raw date string is not empty
  if (rawDate) {
    // Extract the date and time
    const dateTimeArray = rawDate.split('T');
    
    if (dateTimeArray.length === 2) {
      const datePart = dateTimeArray[0];
      const timePart = dateTimeArray[1].split('.')[0]; // Remove milliseconds

      const formattedDateTime = `${datePart} ${timePart}`;
      
      // Convert formatted date-time to UNIX timestamp
      const timestamp = new Date(formattedDateTime).getTime();
      
      return timestamp;
    } else {
      console.error('Invalid date string format:', rawDate);
      return null;
    }
  } else {
    console.error('Date string not found in DOM element');
    return null;
  }
}

export default dataFetchingSCA;