import { config } from "dotenv";
//@ts-ignore
import oAuth1a, { encode,authHeader } from "twitter-v1-oauth";
import axios from "axios";
import FormData from "form-data";
import { createWriteStream, writeFile } from "fs";
import fetch from "isomorphic-fetch";
const app = require("express")();

config();
const media_url = "https://upload.twitter.com/1.1/media/upload.json";

const search_url = "https://api.twitter.com/1.1/search/tweets.json";
const tweet_url = "https://api.twitter.com/1.1/statuses/update.json";

const method = "POST";
const params = { q: "Jos Nigeria" };
const form = new FormData();

const oAuthOptions = {
    api_key: process.env.TWITTER_API_KEY || "",
    api_secret_key: process.env.TWITTER_API_SECRET || "",
    access_token: process.env.TWITTER_ACCESS_TOKEN || "",
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET || "",
};

const upload_media = async(url: string)=>{
    const media_data =await axios({url: url, method: "get",  responseType: "text",responseEncoding: "base64"})
    // writeFile("./image.jpg", Buffer.from(media_data.data), {encoding: "binary"}, console.log)
    // media_data.data.pipe(createWriteStream("./image.jpg"))
    const rawFile = media_data.data

    const oAuthOptions = {
        api_key: process.env.TWITTER_APP_KEY || "",
        api_secret_key: process.env.TWITTER_SECRET_KEY || "",
        // access_token: "U09zX2h2LXFDYWNfakw2VHJZbFBraGpNZkpmNWlYNjI5VVd4SW5aU2h6MENZOjE2NjExNzIxOTYxNDg6MTowOmF0OjE",
        access_token: process.env.TWITTER_ACCESS_TOKEN||"",
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET || "",
    };
    const data = { media_data: rawFile };
    
    const authorization = oAuth1a({ method, url: media_url, data }, oAuthOptions);

    axios
    .post(media_url, encode(data), {
        headers: {
            authorization,
        },
    })
    .then(({ data }) => {
        console.log(data, "Here")
        // tweet("Venmun to the world", data.media_id_string)
    })
    .catch((err) => {

        if (err.response) {
            return console.log(err.response.data.errors);
        }
        console.log(err);

    });

}

const tweet = (text: string, media_ids?: string) => {
    let data;
    if(media_ids){
        data= { status: text, media_ids: media_ids }
    }else{
        data = { status: text }
    }
    //@ts-ignore
    const authorization = oAuth1a({ method, url: tweet_url, data }, oAuthOptions);
    axios
        //@ts-ignore
        .post(media_url, encode(data), {
            headers: {
                authorization: authHeader({
                    method, tweet_url,data 
                }),
            },
        })
        .then(({ data }) => console.log(data))
        .catch((err) => {
            if (err.response) {
                return console.log(err.response.data.errors);
            }
            console.log(err);
        });
};

// upload_media("https://firebasestorage.googleapis.com/v0/b/venmunn.appspot.com/o/posts%2F2022-7-5?alt=media&token=fe199dab-d314-4e89-84aa-db076a991bcb")
// tweet("Venmun")
