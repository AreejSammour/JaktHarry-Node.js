import axios from 'axios';
import cheerio from 'cheerio';
import { db } from '../db.js';
import util from 'util';
import { urlConfig } from './urlConfig.js';
import getText from './get-text.js';
import selectRandomImage from './fetch-image.js';

const queryAsync = util.promisify(db.query).bind(db);

const fetchAndSaveNews = async (urlKey) => {
  try {
    const response = await axios.get(urlConfig[urlKey]);
    const $ = cheerio.load(response.data);

    const news_data = [];

    const news = $('div .newsItem');
    const category = urlKey.replace(/Url$/, '');

    for (const newsItem of news) {
      const heading = $(newsItem).find('h2 a').text();
      const link = $(newsItem).find('h2 a').attr('href');
      const NDate = $(newsItem).find('.info p').text();

      let { text, intro, urlImg } = await getText(link);
      if (!urlImg){
        urlImg = await selectRandomImage();
      }
      
      const fkuid = 1;

      const existingPost = await queryAsync("SELECT * FROM posts WHERE `title` = ? AND `desc` = ?", [heading, intro]);

      if (existingPost && existingPost.length > 0) {
        continue;
      }

      try {
        const insertQuery = "INSERT INTO posts (`title`, `desc`, `date`, `text`, `cat`, `img`, `uid`) VALUES (?)";
        const values = [heading, intro, NDate, text, category, urlImg, fkuid];
        const postResult = await queryAsync(insertQuery, [values]);
        const postId = postResult.insertId;

        if (category === "aktiviteter" && postId) {
          const currentDate = new Date();
          const adminDate = currentDate.toISOString().split('T')[0] || null;
          const deadline = currentDate.toISOString().split('T')[0] || null;
          const status = "closed";
          const price = 0;
          const spots = 0;
          const qActivity = "INSERT INTO ActivityDetails (`ActivityId`, `status`, `adminDate`, `deadline`, `price`, `spots`) VALUES (?)";
          const activityValues = [postId, status, adminDate, deadline, price, spots];

          await queryAsync(qActivity, [activityValues]);
        }

        news_data.push({ heading, intro, NDate, text, category, urlImg, fkuid });
      } catch (dbError) {
        console.error('Database error:', dbError.message);
        console.error(dbError.stack);
      }
    }

  } catch (error) {
    console.error('Error fetching or saving news data:', error.message);
    console.error(error.stack);
  }
}

export default fetchAndSaveNews;
