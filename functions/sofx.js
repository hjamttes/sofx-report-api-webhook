const https = require("https");
const { parse } = require("node-html-parser");

exports.handler = async function(event, context) {
  try {
    // Fetch SOFX page
    const html = await new Promise((resolve, reject) => {
      https.get("https://www.sofx.com/category/special-interest/north-america-special-interest/", res => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => resolve(data));
      }).on("error", err => reject(err));
    });

    // Parse HTML using node-html-parser (single-file library)
    const root = parse(html);
    const titles = [];
    const elements = root.querySelectorAll(".td-module-title a");
    for (let i = 0; i < Math.min(5, elements.length); i++) {
      titles.push(elements[i].text.trim());
    }

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
      body: JSON.stringify({ fulfillmentText: "I couldn't load the latest SOFX news at this time." })
    };
  }
};
