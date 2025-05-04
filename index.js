const express = require('express');
const line = require('@line/bot-sdk');
const fs = require('fs');

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);
const app = express();

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userText = event.message.text.toLowerCase();
  if (userText.includes('menu') || userText.includes('輪播')) {
    const carousel = JSON.parse(fs.readFileSync('./carousel.json', 'utf8'));
    const message = {
      type: 'flex',
      altText: '輪播選單',
      contents: carousel
    };
    return client.replyMessage(event.replyToken, message);
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: '請輸入「menu」或「輪播」來查看選單喔～'
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`LINE Bot is running on port ${port}`);
});
