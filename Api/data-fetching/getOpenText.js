import axios from "axios";
import cheerio from "cheerio";

const getOpenText = async (url) => {
  const baseURL = "https://";
  const fullURL = url.startsWith("/") ? baseURL + url : url;
  try {
    const response = await axios.get(fullURL);

    // Check if the HTTP status code indicates an error (e.g., 4xx or 5xx)
    if (response.status === 404) {
      console.warn("URL not found:", url);
      return { text: "" };
    }

    const $ = cheerio.load(response.data);
    let text = "";
    const textElement = $("div[itemprop='articleBody']");
    text = textElement.text().trim();
  
    if (text.length === 0) {
      console.warn("No readable text found on the page.");
    }

    return { text };
  } catch (error) {
    console.error("Error fetching or saving text data:", error.message);
  //  console.error("Full Error:", error);
    return { text: ""  }; // Return empty string in case of an error
  }
};

export default getOpenText;

