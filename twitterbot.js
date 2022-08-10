require("dotenv").config();
const twitter = require("twitter-api-v2");
const ejs = require("ejs");
const cron = require("node-cron");
const fetch = require("isomorphic-fetch");
const app = require("express")()
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
        client.v2
            .tweet(message, { media: { media_ids: [media] } })
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                console.log(err.data.errors);
            });
        return;
    }
    if (message.length >= 240) {
        let tweets = [];
        let index = 1;
        for (let i = Math.round(message.length / 240); i >= 0; i--) {
            if (tweets.length === 0) {
                tweets.push(message.substring(0, 240));
            } else if (i === 1) {
                tweets.push(
                    message.substring(
                        (index - 1) * 240 === 0 ? 240 : (index - 1) * 240,
                        index * 240 === 0 ? 240 : index * 240
                    )
                );
            } else {
                let str = message.substring(
                    (index - 1) * 240 === 0 ? 240 : (index - 1) * 240,
                    index * 240 === 0 ? 240 : index * 240
                );
                if (str.length > 0) {
                    tweets.push({
                        text: str,
                    });
                }
            }
            index += 1;
        }
        client.v2.tweetThread(tweets);

        return;
    }

    client.v2
        .tweet(message)
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err.data.errors);
        });
}

async function sendTweet(token, secret, code) {
    const userClient = new twitter.TwitterApi({
        appKey: process.env.TWITTER_KEY,
        appSecret: process.env.TWITTER_SECRET_KEY,
        accessToken: token,
        accessSecret: secret,
    });
    const user = await userClient.login(code);
    fetch("https://quotes.rest/qod", { headers: { "Content-Type": "application/json" } })
        .then((data) =>
            data
                .json()
                .then((res) => {
                    const quote = res.contents.quotes[0];
                    tweet(user.client, quote.quote + " - " + quote.author).catch(err=>console.log(err));
                })
                .catch((err) => {
                    console.log(err);
                })
        )
        .catch((err) => {
            console.log(err);
            response.send("Error");
        });
}

// cron.schedule("*/10 * * * * *", (now) => {
//     sendTweet(process.env.OAUTH_TOKEN, process.env.OAUTH_TOKEN_SECRET, process.env.CODE).then(()=>{
//         console.log("Success")
//     }).catch(err=>{
//         console.log(err)
//     });
// });

// sendTweet(process.env.OAUTH_TOKEN, process.env.OAUTH_TOKEN_SECRET, process.env.CODE).then(()=>{
//     console.log("Success")
// }).catch(err=>{
//     console.log(err)
// });

// cron.schedule("0 7 * * *", (now) => {
//     console.log(now);
// });
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

app.get("/register",(req, res)=>{

    getUserClient("http://localhost:3000/register/callback").then(response=>{
        console.log(response.auth)
        res.end(response.html)
    })
})



app.get("/register/callback",(req, res)=>{
    console.log(req.query)
    console.log(req.url)
    res.end("Success")
})

app.listen("3000",()=>{
    console.log("Serving on port 3000")
})

module.exports = { tweet: tweet, getUserClient: getUserClient };


module.exports = { tweet: tweet, getUserClient: getUserClient, sendTweet: sendTweet };
