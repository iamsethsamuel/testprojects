const functions = require("firebase-functions");
const fetch = require("isomorphic-fetch");
const twitter = require("twitter-api-v2");
const { getUserClient, tweet } = require("../twitterbot");

exports.twitterbot = functions.runWith({ timeoutSeconds: "120" }).https.onRequest(async function (request, response) {
    const querystring = new URLSearchParams(request.url.substring(1));
    if (querystring.get("code")) {
        if (!process.client) {
            process.client = await getUserClient();
            response.send(process.client.html);
            return;
        }
        const userClient = new twitter.TwitterApi({
            appKey: process.env.TWITTER_KEY,
            appSecret: process.env.TWITTER_SECRET_KEY,
            accessToken: process.client.auth.oauth_token,
            accessSecret: process.client.auth.oauth_token_secret,
        });
        const user = await userClient.login(querystring.get("code"));
        fetch("https://quotes.rest/qod", { headers: { "Content-Type": "application/json" } })
            .then((data) =>
                data
                    .json()
                    .then((res) => {
                        const quote = res.contents.quotes[0];
                        fetch(quote.background).then((data) =>
                            data.blob().then(async function (file) {
                                const buffer = Buffer.from(await file.arrayBuffer());
                                tweet(user.client, quote.quote, buffer, file.type);
                                response.send("Success");
                            })
                        );
                    })
                    .catch((err) => {
                        console.log(err);
                    })
            )
            .catch((err) => {
                console.log(err);
                response.send("Error");
            });
        exports.scheduledFunction = functions.pubsub
            .schedule("every day")
            .timeZone("GMT")
            .onRun((context) => {
                fetch("https://quotes.rest/qod", { headers: { "Content-Type": "application/json" } })
                    .then((data) =>
                        data
                            .json()
                            .then((res) => {
                                const quote = res.contents.quotes[0];
                                fetch(quote.background).then((data) =>
                                    data.blob().then(async function (file) {
                                        const buffer = Buffer.from(await file.arrayBuffer());
                                        tweet(user.client, quote.quote, buffer, file.type);
                                        response.send("Success");
                                    })
                                );
                            })
                            .catch((err) => {
                                console.log(err);
                            })
                    )
                    .catch((err) => {
                        console.log(err);
                        response.send("Error");
                    });
            });
        return "Tweet sent";
    } else {
        process.client = await getUserClient();
        response.send(process.client.html);
    }
});
