import axios from "axios";
import cheerio from "cheerio";

const getText2 = async (url) => {
  try {
    const response = await axios.get(url);

    // Check if the HTTP status code indicates an error (e.g., 4xx or 5xx)
    if (response.status >= 400) {
      console.warn(
        `Failed to fetch content. HTTP Status Code: ${response.status}`
      );
      return { heading: "",text: "", intro: "" ,NDate: ""};
    }
    const $ = cheerio.load(response.data);

    let heading = "";
    let text = "";
    let intro = "";
    let NDate = "";
    let urlImg = "";

    const introElement = $("section .post");

    const headingText = $(introElement).find('h1').text();
    heading = headingText;

    const NDateText = $(introElement).find('.post-meta .date').text();
    const dateObject = new Date(NDateText);
    NDate = dateObject.toISOString().slice(0, 19).replace('T', ' ');

    const textElement = $(introElement).find(".entry p").text();
    text = textElement; // Extracting text content and trimming any leading/trailing whitespace
    
    const urlImgElement = $("#featured-image a img");
    if (urlImgElement.length > 0) {
      urlImg = urlImgElement.attr('src');
    } else {
      urlImg = "";
    }
    
    
    // Check if the extracted text is empty
    if (text.length === 0) {
      console.warn("No readable text found on the page.");
    }

    return { heading,text,intro,NDate,urlImg };
  } catch (error) {
    console.error("Error fetching or saving text data:", error.message);
    console.error("Full Error:", error);
    return { heading: "",text: "", intro: "" ,NDate: "" ,urlImg:""}; // Return empty string in case of an error
  }
};

export default getText2;