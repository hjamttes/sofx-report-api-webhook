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

    // Simple regex to pull first 5 news titles
    const matches = [...html.matchAll(/<h3 class="td-module-title"><a [^>]+>(.*?)<\/a><\/h3>/gi)];
    const titles = matches.slice(0,5).map(m => m[1].replace(/&amp;/g,"&").replace(/&quot;/g,'"').trim());

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
