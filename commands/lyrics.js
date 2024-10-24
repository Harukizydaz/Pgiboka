const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "lyrics",
  description: "Get song lyrics by title",
  author: "chilli",

  async execute(senderId, args, pageAccessToken) {
    const songTitle = args.join(" ");

    if (!songTitle) {
      return sendMessage(senderId, {
        text: `Usage: lyrics [song title]`
      }, pageAccessToken);
    }

    try {
      const res = await axios.get(`https://markdevs69v2-679r.onrender.com/api/lyrics/song`, {
        params: { title: songTitle }
      });

      if (!res.data || !res.data.content) {
        throw new Error("No lyrics found for this song.");
      }

      const { title, artist, lyrics, url, song_thumbnail } = res.data.content;
      const lyricsMessage = `🎵 *${title}* by *${artist}*\n\n${lyrics}\n\n🔗 Read more: ${url}`;

      sendLongMessage(senderId, lyricsMessage, pageAccessToken);

      if (song_thumbnail) {
        await sendMessage(senderId, {
          attachment: {
            type: "image",
            payload: {
              url: song_thumbnail
            }
          }
        }, pageAccessToken);
      }

    } catch (error) {
      console.error("Error retrieving lyrics:", error);
      sendMessage(senderId, {
        text: `Error retrieving lyrics. Please try again or check your input.`
      }, pageAccessToken);
    }
  }
};

function sendLongMessage(senderId, text, pageAccessToken) {
  const maxMessageLength = 2000;
  const delayBetweenMessages = 1000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);

    sendMessage(senderId, { text: messages[0] }, pageAccessToken);

    messages.slice(1).forEach((message, index) => {
      setTimeout(() => sendMessage(senderId, { text: message }, pageAccessToken), (index + 1) * delayBetweenMessages);
    });
  } else {
    sendMessage(senderId, { text }, pageAccessToken);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const regex = new RegExp(`.{1,${chunkSize}}`, 'g');
  return message.match(regex);
}
