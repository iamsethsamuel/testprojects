const fs = require("fs");
const ejs = require("ejs");
const { google } = require("googleapis");
const moment = require("moment");
const SCOPES = ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"];
const xlsx = require("node-xlsx");
const app = require("express")();
const file = xlsx.parse("./ESC.xlsx");
let auth;
let index = 3;

function init(name, date) {
    fs.readFile("./credentials.json", (err, content) => {
        if (err) return console.log("Error loading client secret file:", err);
        // Authorize a client with credentials, then call the Google Calendar API.
        return authorize(JSON.parse(content), (auth) => {
            addEvent(auth, name, date);
        });
    });
}

async function authorize(cred, cb) {
    const { client_secret, client_id, redirect_uris } = cred.installed;
    const authClient = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    if (!process.client) return getAccessToken(authClient, cb);
    authClient.generateAuthUrl({ scope: SCOPES })
    authClient.setCredentials(JSON.parse(process.token));
    auth = authClient;
}

function getAccessToken(code, client, cb) {
    client.getToken(code, (err, token) => {
        if (err) {
            console.error("Error retrieving access token", err);
            return;
        }
        client.setCredentials(token);
        process.token = token;
        cb(client);
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

function addToCalendar(res) {
    setInterval(() => {
        let data = file[0].data[index];
        let birthday =
            typeof data[4] === "string"
                ? data[4].replace("st", "").replace("th", "").replace("nd", "").replace("rd", "")
                : "";
        const date = birthday.substring(0, birthday.lastIndexOf(" ") + 1);
        init(data[1], date.includes("Augu ") ? date.replace("Augu ", "August ") : date);
        index += 1;
        if (index >= file[0].data.length) {
            res("Events added to calendar");
        }
    }, 1000);
}

app.get("/", async function (req, res) {
    console.log("");
    if (req.query) {
        const authURL = await 
        const html = await ejs.renderFile("../templates/submitcode.ejs", { authlink: authURL, url: url });
        res.end(html);
    } else {
        addToCalendar(res.end);
    }
});

app.listen(8080, () => {
    console.log("Listening on port 8080");
});
