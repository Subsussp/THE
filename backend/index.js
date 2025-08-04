const express = require('express');
const ytdl = require('@distube/ytdl-core'); 
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config()
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL
}));
app.use(express.json());
app.get('/audio', async (req, res) => {
  const videoUrl = req.query.url;
  const type = req.query.type;
  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return res.status(400).send('Invalid or missing URL');
  }

  try {
    const info = await ytdl.getInfo(videoUrl);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    res.setHeader('Content-Type', 'audio/webm');
    ytdl(videoUrl, { format }).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error streaming audio');
  }
});


app.post('/sugg', async (req, res) => {
  const sugg = req.body.message;
  if (!sugg || typeof sugg !== 'string') {
    return res.status(400).send('Invalid suggestion');
  }
  try {
    const formspreeRes = await fetch('https://formspree.io/f/mldlwkwv', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        _replyto: 'noreply@example.com', // optional: fake email for reply
      }),
    });
    res.status(200).send('Received!');
  }catch(error){
    console.log(error)
    res.status(400).send('Error');
  }});
app.listen(3000, () => {
  console.log('Server running');
});
