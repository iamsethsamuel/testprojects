require("dotenv").config();
const twitter = require("twitter-api-v2");
const ejs = require("ejs");

const client = new twitter.TwitterApi({
    appKey: process.env.TWITTER_KEY,
    appSecret: process.env.TWITTER_SECRET_KEY,
});

async function getUserClient(url) {
    const auth = await client.generateAuthLink();
    const html = await ejs.renderFile("../templates/submitcode.ejs", { authlink: auth.url, url: url });
    return { html: html, auth: auth };
}

async function tweet(client, message, file, fileType) {
    let media;
    if (file) {
        media = await client.v1.uploadMedia(file, { type: fileType });
    }
    client.v2
        .tweet(message, { media: { media_ids: [media] } })
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err.data.errors);
        });
}


module.exports = { tweet: tweet, getUserClient: getUserClient };
