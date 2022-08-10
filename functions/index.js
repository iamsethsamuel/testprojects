const functions = require("firebase-functions");
const fetch = require("isomorphic-fetch");
const { getUserClient, tweet, sendTweet } = require("../twitterbot");

exports.twitterbot = functions.runWith({ timeoutSeconds: "120" }).https.onRequest(async function (request, response) {
    const querystring = new URLSearchParams(request.url.substring(1));
    if (querystring.get("code")) {
        if (!process.client) {
            process.client = await getUserClient();
            response.send(process.client.html);
            return;
        }
        sendTweet(process.client.auth.oauth_token, process.client.auth.oauth_token_secret, querystring.get("code"))
            .then(() => {
                response.send("Success");
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        process.client = await getUserClient();
        response.send(process.client.html);
    }
});
