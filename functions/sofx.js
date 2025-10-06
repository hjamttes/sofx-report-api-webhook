const https = require("https");

exports.handler = async function(event, context) {
  try {
    // Fetch the SOFX RSS feed
    const xml = await new Promise((resolve, reject) => {
      https.get("https://www.sofx.com/feed/", res => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => resolve(data));
      }).on("error", err => reject(err));
    });

    // Simple regex to extract <title> inside <item> tags
    const matches = [...xml.matchAll(/<item>[\s\S]*?<title>(.*?)<\/title>/gi)];
    const titles = matches.slice(0,5).map(m => 
      m[1].replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim()
    );

    if (titles.length === 0) {
      titles.push("No news items found.");
    }

    // Build SSML response
    let speech = "<speak>Here are today's top five SOFX news items:<break time='500ms'/>";
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
