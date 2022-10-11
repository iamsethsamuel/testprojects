require("dotenv").config();
const twitter = require("twitter-api-v2");
const ejs = require("ejs");
const cron = require("node-cron");
const fetch = require("isomorphic-fetch");
const app = require("express")();

const client = new twitter.TwitterApi({
    appKey: process.env.TWITTER_APP_KEY,
    appSecret: process.env.TWITTER_SECRET_KEY,
});

async function getUserClient(url) {
    const auth = await client.generateAuthLink();
    const html = await ejs.renderFile("./templates/submitcode.ejs", { authlink: auth.url, url: url });
    return { html: html, auth: auth };
}

async function tweet(client, message, file, fileType) {
    let media;
    if (file) {
        media = await client.v1.uploadMedia(file, { type: fileType });
        console.log(media, file);
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

// const userClient = new twitter.TwitterApi({
//     appKey: process.env.TWITTER_KEY,
//     appSecret: process.env.TWITTER_SECRET_KEY,
//     accessToken: "T7mDZQAAAAABZFg_AAABgrHbWvE",
//     accessSecret: "AqLOXWzwihDYYSh15waG8zqxF1y6jEPN",
// });
// userClient.login("0512066")
// userClient.v1.user().then(console.log)

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
                    tweet(user.client, quote.quote + " - " + quote.author).catch((err) => console.log(err));
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

app.get("/register", (req, res) => {
    getUserClient("http://localhost:3000/register/callback").then((response) => {
        process.env.OAUTH_TOKEN = response.auth.oauth_token;
        process.env.OAUTH_TOKEN_SECRET = response.auth.oauth_token_secret;
        res.end(response.html);
    });
});

app.get("/register/callback", async (req, res) => {
    process.env.CODE = req.query.code;
    console.log(process.env.CODE);
    console.log(process.env.OAUTH_TOKEN);
    console.log(process.env.OAUTH_TOKEN_SECRET);

    res.end("Success");
});
// (async()=>{const userClient = new twitter.TwitterApi("AAAAAAAAAAAAAAAAAAAAAD9YZAEAAAAAEWIq6tOanicpJsu8BMb9jXbrcHo%3DsIGA7Z8IT2c4Rz0bK7UehrA7Mz6WNEMJQBgdSBwI7PMmH5uPCb");
// // const user = await userClient.login(process.env.CODE);
// // console.log(user.client.currentUser)
// })()
// const userClient = new twitter.TwitterApi({
//     appKey: process.env.TWITTER_KEY,
//     appSecret: process.env.TWITTER_SECRET_KEY,
//     accessToken: process.env.OAUTH_TOKEN,
//     accessSecret: process.env.OAUTH_TOKEN_SECRET,
// });
// userClient.login(process.env.CODE).then(user=>{
//     console.log(user.client.currentUser)

// }).catch(console.log)
app.get("/tweet", async (req, res) => {
    const userClient = new twitter.TwitterApi({
        appKey: process.env.TWITTER_KEY,
        appSecret: process.env.TWITTER_SECRET_KEY,
        accessToken: process.env.OAUTH_TOKEN,
        accessSecret: process.env.OAUTH_TOKEN_SECRET,
    });
    console.log(process.env.CODE);
    const user = await userClient.login(process.env.CODE);
    console.log(user.client.currentUser);
    // user.client.v2.tweet("Hey there").then(console.log)
    user.client.v1
        .uploadMedia("./logo.jpg", { type: "image" })
        .then(console.log)
        .catch((err) => {
            console.log("Upload Error", err);
        });

    // sendTweet(process.env.OAUTH_TOKEN, process.env.OAUTH_TOKEN_SECRET, process.env.CODE)
    //     .then((value) => {
    //         console.log(value);
    //         res.end("Success");
    //     })
    //     .catch((err) => {
    //         res.end(String(err));
    //     });
});

app.post("/venmun/me", (req, res) => {
    req.on("data", (data) => {
        console.log(JSON.parse(data));
    });
});

app.listen("4000", () => {
    console.log("Serving on port 4000");
}); 

module.exports = { tweet: tweet, getUserClient: getUserClient, sendTweet: sendTweet };

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
