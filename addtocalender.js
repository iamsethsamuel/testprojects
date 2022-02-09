const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const moment = require("moment");
const SCOPES = ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"];
const TOKEN_PATH = "calendarToken.json";
const xlsx = require("node-xlsx");

function init(name, date) {
    console.log(name, date);
    fs.readFile("./credentials.json", (err, content) => {
        if (err) return console.log("Error loading client secret file:", err);
        // Authorize a client with credentials, then call the Google Calendar API.
        authorize(JSON.parse(content), (auth) => {
            addEvent(auth, name, date);
        });
    });
}

function authorize(cred, cb) {
    const { client_secret, client_id, redirect_uris } = cred.installed;
    const authClient = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(authClient, cb);
        authClient.setCredentials(JSON.parse(token));
        cb(authClient);
    });
}

function getAccessToken(client, cb) {
    const authURL = client.generateAuthUrl({ scope: SCOPES });
    console.log("Authorize this app by visiting this url:", authURL);

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    rl.question("Enter the code from that page here: ", (code) => {
        rl.close();
        client.getToken(code, (err, token) => {
            if (err) {
                console.error("Error retrieving access token", err);
                return;
            }
            client.setCredentials(token);

            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.log(err);
                console.log("Token saved at:", TOKEN_PATH);
            });
            cb(client);
        });
    });
}

function listEvents(auth) {
    const calendar = google.calendar({ version: "v3", auth });
    calendar.events.list(
        {
            calendarId: "primary",
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: "startTime",
        },
        (err, res) => {
            if (err) return console.log("The API returned an error: " + err);
            const events = res.data.items;
            if (events.length) {
                console.log("Upcoming 10 events:");
                events.map((event, i) => {
                    const start = event.start.dateTime || event.start.date;
                    console.log(`${start} - ${event.summary}`);
                });
            } else {
                console.log("No upcoming events found.");
            }
        }
    );
}

function addEvent(auth, name, date) {
    const calendar = google.calendar({ version: "v3", auth });

    calendar.events.insert(
        {
            auth: auth,

            calendarId: "primary",
            resource: birthdayMessage(name, date),
        },
        (err, event) => {
            if (err) {
                console.log("There was an error contacting the Calendar service: " + err);
                return;
            }
            console.log(name, date, "Added");
        }
    );
}

function birthdayMessage(name, date) {
    if (!moment(date, "DDMMMMY").isValid()) return;
    const momentdate = moment(date, "DDMMMMY").subtract(17, "hours").add(1, "day");
    return {
        summary: `${name}'s Birthday`,
        location: "ESC",
        description: `Please don't forget to wish ${name} a happy birthday on the group`,
        start: {
            dateTime: momentdate.toDate(),
            timeZone: "GMT",
        },
        end: {
            dateTime: momentdate.add(16, "hours").toDate(),
            timeZone: "GMT",
        },
        recurrence: ["RRULE:FREQ=YEARLY;COUNT=50"],
        reminders: {
            useDefault: false,
            overrides: [{ method: "popup", minutes: 10 }],
        },
    };
}
let index = 3;

const file = xlsx.parse("./ESC.xlsx");

// for (const data of file[0].data) {
//     if (index > 99) break;
//     index += 1;

//     
// }

// for (const data of file[0].data) {
//     if (index > 199) break;
//     index += 1;

//     let birthday =
//         typeof data[4] === "string"
//             ? data[4].replace("st", "").replace("th", "").replace("nd", "").replace("rd", "")
//             : "";
//     const date = birthday.substring(0, birthday.lastIndexOf(" ") + 1);
//     // setInterval(() => {
//     //     init(data[1], date.includes("Augu ") ? date.replace("Augu ", "August ") : date);
//     // }, 1000);
// }
setInterval(() => {
    let data = file[0].data[index]
    let birthday =
        typeof data[4] === "string"
            ? data[4].replace("st", "").replace("th", "").replace("nd", "").replace("rd", "")
            : "";
    const date = birthday.substring(0, birthday.lastIndexOf(" ") + 1);
    init(data[1], date.includes("Augu ") ? date.replace("Augu ", "August ") : date);
    index += 1
    if(index >=file[0].data.length){
        process.exit()
    }
}, 1000);
