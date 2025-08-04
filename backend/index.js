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
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0]; // e.g. "2025-08-02"
  const fileName = `sugg-${dateStr}.txt`;
  const filePath = path.join(__dirname + '/docs', fileName);

  const line = `[${new Date().toLocaleTimeString()}] ${sugg}\n`;

  fs.appendFile(filePath, line, (err) => {
    if (err) {
      console.error('Failed to save suggestion:', err);
      return res.status(500).send('Failed to save suggestion');
    }
    res.status(200).send('Received!');
  });});
app.listen(3000, () => {
  console.log('Server running');
});
