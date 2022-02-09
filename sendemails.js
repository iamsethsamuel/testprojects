require("dotenv").config()
const xlsx = require("node-xlsx"),
    fs = require("fs"),
    nodemailer = require('nodemailer'),
    emailcred = require('./t.json'),
    { google } = require("googleapis"),
    send = require('gmail-send')({
        user: process.env.USER,
        pass: process.env.PASSWORD,
        to:   '',
        subject: 'test subject',
      });
    OAuth2 = google.auth.OAuth2;
// send({text:"hey"},(e,r,f)=>console.log(e,r,f))

const workSheetsFromFile = xlsx.parse(`./UN Search Results 2020-12-30 19-55 (1).xlsx`)
// console.log(workSheetsFromFile[1].data)
const emails = []
for(const data of workSheetsFromFile[1].data ){
    if(data[11]==="first"){
        let name = data[2]+"@"+[data[10].includes("/")?data[10].substring(0,data[10].indexOf("/")):data[10]]
        emails.push(name.toLowerCase())
    }else if(data[11]==="last"){
        let name = data[3]+"@"+[data[10].includes("/")?data[10].substring(0,data[10].indexOf("/")):data[10]]
        emails.push(name.toLowerCase())
    }else if(data[11]==="first '.' last"){
        let name = data[2]+"."+data[3]+"@"+[data[10].includes("/")?data[10].substring(0,data[10].indexOf("/")):data[10]]
        emails.push(name.toLowerCase())
    }else if(data[11]=== "first_initial last"){
        let name = data[3]+data[2]+"@"+[data[10].includes("/")?data[10].substring(0,data[10].indexOf("/")):data[10]]
        emails.push(name.toLowerCase())
    }else if(data[11]=== "first_initial '-' last"){
        let name = data[2]+"-"+data[3]+"@"+[data[10].includes("/")?data[10].substring(0,data[10].indexOf("/")):data[10]]
        emails.push(name.toLowerCase())
    }
}
// fs.writeFile("./emails.json",JSON.stringify(emails),(err)=>console.log(err))


const oauth2Client = new OAuth2(
    process.env.CLIENTID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);
oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
});
const accessToken = oauth2Client.getAccessToken()

const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
         type: "OAuth2",
         user: process.env.USER, 
         pass:process.env.PASSWORD,
         clientId: process.env.CLIENTID,
         clientSecret: process.env.CLIENT_SECRET,
         refreshToken: process.env.REFRESH_TOKEN,
         accessToken: accessToken
    }
});

function sendEmail(to,subject,text){
    const mailOptions = {
        from: process.env.USER,
        to: to,
        subject: subject,
        generateTextFromHTML: true,
        html: text
   };
   smtpTransport.sendMail(mailOptions, (error, response) => {
    error ? console.log(error) : console.log(response);
    smtpTransport.close();
});
}

// let s = ""
// for(let i = 501;i <651; i++){
//     s+=(emails[i]+",")
// }
// console.log(s)
// sendEmail("sethsamuel03@gmail.com","Trying","<b>THis is me trying</b>")
// for(let i = 0; i<151; i++){

// }
google.gmail