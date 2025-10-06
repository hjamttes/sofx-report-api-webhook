const axios = require("axios");
const cheerio = require("cheerio");

exports.handler = async function(event, context) {
  try {
    // Fetch the SOFX North America Special Interest page
    const response = await axios.get(
      "https://www.sofx.com/category/special-interest/north-america-special-interest/"
    );
    const html = response.data;
    const $ = cheerio.load(html);

    // Grab the first 5 news titles
    let titles = [];
    $(".td-module-title a").each((i, el) => {
      if (i < 5) titles.push($(el).text().trim());
    });

    // Build SSML response
    let speech = "<speak>Here are today's top five North America Special Interest news items:<break time='500ms'/>";
    titles.forEach((t, i) => {
      speech += `<break time='400ms'/>${i + 1}. ${t}.`;
    });
    speech += "<break time='500ms'/>End of briefing.</speak>";

    return {
      statusCode: 200,
      body: JSON.stringify({ fulfillmentText: speech })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        fulfillmentText:
          "I'm sorry, I couldn't load the latest SOFX news at this time."
      })
    };
  }
};
