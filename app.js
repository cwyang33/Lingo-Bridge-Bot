require('dotenv').config();

const express = require('express');
const line = require('@line/bot-sdk');
const { OpenAI } = require('openai')

const openai = new OpenAI({  
  apiKey: process.env.OPEN_AI_LINE_SECRET 
})

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
async function handleEvent(event) {
  try {
    if (event.type !== 'message' || event.message.type !== 'text') {
      // ignore non-text-message event
      return Promise.resolve(null);
    }

    const userInput = event.message.text.trim()
    //console.log("handleEvent $$$ gpt-3.5");
    const messages = [
      {
        role: 'user',
        content: userInput,
      },
      {
        role: 'system',
        content: 'You are a helpful assistant.',
      },
    ]

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 1,
      messages: messages,
      // chatgpt會用token計費，所以非必要不要設太長
      max_tokens: 200,
    });
    
    // create a echoing text message
    const echo = { type: 'text', text: completion.choices[0].message.content ||    
    // use reply API
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [echo],
    })}
  } catch (err) {
    console.log(err)
  }
}
// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

