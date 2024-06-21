import axios from "axios";
import cheerio from "cheerio";

const getText = async (url) => {
  try {
    let fullUrl;

    if (url.startsWith("https://")) {
      fullUrl = url;
    } else {
      fullUrl = url.includes("https://")
        ? url
        : `https:///${url}`;
    }

    const response = await axios.get(fullUrl);

    // Check if the HTTP status code indicates an error (e.g., 4xx or 5xx)
    if (response.status >= 400) {
      console.warn(
        `Failed to fetch content. HTTP Status Code: ${response.status}`
      );
      return { text: "", intro: "", urlImg: "" };
    }

    const $ = cheerio.load(response.data);

    let intro = "";
    let text = "";
    let urlImg = "";

    if (fullUrl.startsWith("https:///")) {
      const introElement = $("div span p");
      intro = introElement.text().trim();

      const textElement = $("div p");
      text = textElement.text().trim();

      const urlImgElement = $("div.grid div img");
      urlImg = urlImgElement.attr('src');
      
    } else {
      // Selecting the correct element for text extraction
      const introElement = $("div .newsItem p");
      const introHtml = introElement.html(); // Get HTML content

      // Convert <br> tags to line breaks and then trim any leading/trailing whitespace
      intro = introHtml
        ? introHtml.replace(/<br\s*[/]?>/gi, "\n").trim()
        : "";
      const textElement = $("div .newsItem div p");
      text = textElement.text().trim(); // Extracting text content and trimming any leading/trailing whitespace

      const urlImgElement = $("div .newsItem div div img");
      urlImg = "https:///" + urlImgElement.attr('src');
    }

    // Check if the extracted text is empty
    if (text.length === 0) {
      console.warn("No readable text found on the page.");
    }

    return { text, intro, urlImg };
  } catch (error) {
    console.error("Error fetching or saving text data:", error.message);
    console.error("Full Error:", error);
    return { text: "", intro: "", urlImg:"" }; // Return empty string in case of an error
  }
};

export default getText;

