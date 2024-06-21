import axios from 'axios';
import cheerio from 'cheerio';
import { urlConfig } from './urlConfig.js';

const dataFetchingArrenden = async (urlKey) => {
  try {
  const response = await axios.get(urlConfig[urlKey]);
  const $ = cheerio.load(response.data);

  const title = $('.property-list ul li .property-list_meta p div').text().trim();


  } catch (error) {
    console.error("Error fetching data: ", error);
  }
}

export default dataFetchingArrenden;
