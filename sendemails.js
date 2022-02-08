const xlsx = require("node-xlsx"),
    fs = require("fs"),
    nodemailer = require('nodemailer'),
    emailcred = require('./t.json'),
    { google } = require("googleapis"),
    send = require('gmail-send')({
        user: 'seth@venmun.com',
        pass: 'gsecturbleaz1',
        to:   'sethsamuel03@@gmail.com',
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
    "337020115213-scfllsdnihm779ibns9kujeiamm0v5pl.apps.googleusercontent.com",
    "DDbuYUWEq6vmO8Teal_9jtBw", // Client Secret
    "https://developers.google.com/oauthplayground" // Redirect URL
);
oauth2Client.setCredentials({
    refresh_token: "1//04BlpLbGMW08fCgYIARAAGAQSNwF-L9Irj8ptCl1Z4wpdbcQPCInXLQI1ezbp08J7wuBSPdZFSKqHf9ELMuFO-w-GWV0XVODhE98"
});
const accessToken = oauth2Client.getAccessToken()

const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
         type: "OAuth2",
         user: "seth@venmun.com", 
         pass:"gsecturbleaz1",
         clientId: "337020115213-scfllsdnihm779ibns9kujeiamm0v5pl.apps.googleusercontent.com",
         clientSecret: "DDbuYUWEq6vmO8Teal_9jtBw",
         refreshToken: "1//04BlpLbGMW08fCgYIARAAGAQSNwF-L9Irj8ptCl1Z4wpdbcQPCInXLQI1ezbp08J7wuBSPdZFSKqHf9ELMuFO-w-GWV0XVODhE98",
         accessToken: accessToken
    }
});

function sendEmail(to,subject,text){
    const mailOptions = {
        from: "seth@venmun.com",
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