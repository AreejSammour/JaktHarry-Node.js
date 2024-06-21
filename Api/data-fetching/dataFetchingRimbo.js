import axios from 'axios';
import cheerio from 'cheerio';
import { db } from '../db.js';
import util from 'util';
import { urlConfig } from './urlConfig.js';
import selectRandomImage from './fetch-image.js';

const queryAsync = util.promisify(db.query).bind(db);

const dataFetchingRimbo = async (urlKey) => {
  try {

    let heading = "";
    let text = "";
    let intro = "";
    let NDate = "";
    let urlImg = "";

    const response = await axios.get(urlConfig[urlKey]);
    const $ = cheerio.load(response.data);

    const news_data = [];

    const news = $('div #main .nyheter');
    const category = urlKey.replace(/Url$/, ''); // Remove "Url" from the end of the urlKey

    for (const newsItem of news) {
      heading = $(newsItem).find('h1 a').attr('title');

      const NDateText = $(newsItem).find('.post-meta .date').text().trim();
      const NDate = parseDate(NDateText);
      
      intro = $(newsItem).find('.entry p').first().text();
      const paragraphs = $(newsItem).find('.entry p').slice(1).map((index, element) => $(element).text()).get();
      text = paragraphs.join(' ');
      let existingPost = null;

      const urlImgElement = $("section.entry div.wp-caption a img")
      if (urlImgElement.length > 0) {
        urlImg = urlImgElement.attr('src');
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
    }

  } catch (error) {
    console.error('Error fetching or saving news data:', error.message);
    console.error(error.stack); 
  }
}

function parseDate(dateString) {

  const swedishMonths = {
    januari: 0,
    februari: 1,
    mars: 2,
    april: 3,
    maj: 4,
    juni: 5,
    juli: 6,
    augusti: 7,
    september: 8,
    oktober: 9,
    november: 10,
    december: 11
  };
  const parts = dateString.split(' ');
  if (parts.length !== 3) {
    return null;
  }
  const day = parseInt(parts[0]);
  const monthString = parts[1].replace(',', ''); // Remove trailing comma
  const month = swedishMonths[monthString.toLowerCase()]; // Map Swedish month name to numerical value
  const year = parseInt(parts[2]);
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    console.error('Invalid date format:', dateString);
    return null;
  }
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) {
    console.error('Invalid date format:', dateString);
    return null;
  }
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

export default dataFetchingRimbo;