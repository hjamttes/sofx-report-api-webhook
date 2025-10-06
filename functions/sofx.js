const https = require("https");

exports.handler = async function(event, context) {
  try {
    // Fetch the SOFX page
    const html = await new Promise((resolve, reject) => {
      https.get("https://www.sofx.com/category/special-interest/north-america-special-interest/", res => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => resolve(data));
      }).on("error", err => reject(err));
    });

    // Robust parsing: split by known article wrapper
    const splitByArticle = html.split('<h3 class="td-module-title">');
    const titles = [];

    for (let i = 1; i < splitByArticle.length && titles.length < 5; i++) {
      const segment = splitByArticle[i];
      const match = segment.match(/<a [^>]+>(.*?)<\/a>/i);
      if (match && match[1]) {
        // Decode HTML entities
        const title = match[1].replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim();
        titles.push(title);
      }
    }

    if (titles.length === 0) {
      titles.push("No news items found.");
    }

    // Build SSML response
    let speech = "<speak>Here are today's top five North America Special Interest news items:<break time='500ms'/>";
    titles.forEach((t, i) => {
      speech += `<break time='400ms'/>${i+1}. ${t}.`;
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
