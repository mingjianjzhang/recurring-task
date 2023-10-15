const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const { dayMap } = require('./model.js');

const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listEvents(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  const setDate = new Date("2023-11-01")
  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: setDate,
    maxResults: 15,
    singleEvents: true,
    orderBy: 'startTime',
  });
  const events = res.data.items;
  if (!events || events.length === 0) {
    console.log('No upcoming events found.');
    return;
  }
  console.log('Upcoming 10 events:');
  events.map((event, i) => {
    const start = event.start.dateTime || event.start.date;
    console.log(event);
    console.log(`${start} - ${event.summary}`);
  });
}

async function getEvent(auth) {
    const calendar = google.calendar({version: 'v3', auth});
    const event = await calendar.events.get({
        calendarId: 'primary',
        eventId: '6euu1f5cht47inikkl4ojdv7s6'
    });
    console.log(event.data);
}

function createEvent(
    auth, startTime, endTime, 
    endDate, recurrenceDays, reminderTimes, 
    parentTaskName, parentTaskUrl) {
  
  // initialize client
  const calendar = google.calendar({version: 'v3', auth});


  console.log("Creating event..");
  // build recurrence string
  // exampel: 'RRULE:FREQ=WEEKLY;WKST=SU;UNTIL=20240201T075959Z;BYDAY=WE,MO,FR' ]
  let recurString = '';
  let untilString = ''; 
  if (recurrenceDays === null) {
    // skip
  } else if (recurrenceDays.length === 0) {
    untilString = dayjs(endDate).utc().format('YYYYMMDDTHHmmss[Z]');
    recurString = `RRULE:FREQ=WEEKLY;WKST=SU;UNTIL=${untilString};BYDAY=FR,MO,TH,TU,WE,SU;`
  } else {
    untilString = dayjs(endDate).utc().format('YYYYMMDDTHHmmss[Z]')
    const byDay = dayMap.reduce((previousValue, currentValue, currentIndex) => {
        if (recurrenceDays.includes(currentIndex)) {
            return previousValue + currentValue + ',';
        }
        return previousValue;
    }, '').slice(0, -1);
   recurString = `RRULE:FREQ=WEEKLY;WKST=SU;UNTIL=${untilString};BYDAY=${byDay}`;
   console.log(recurString);
  }


  const reminderOverrides = reminderTimes.map(time => {
    return { 'method': 'popup', 'minutes': time }
  })

  // build event
  const event = {
    'summary': parentTaskName,
    'description': parentTaskUrl,
    'start': {
      'dateTime': dayjs(startTime).format(),
      'timeZone': 'America/Los_Angeles',
    },
    'end': {
      'dateTime': dayjs(endTime).format(),
      'timeZone': 'America/Los_Angeles',
    },
    'reminders': {
      'useDefault': false,
      'overrides': reminderOverrides
    },
  };
  if (recurString !== '') {
    event['recurrence'] = [recurString];
  }
  
  calendar.events.insert({
    auth: auth,
    calendarId: 'primary',
    resource: event,
  }, function(err, event) {
    if (err) {
      console.log('There was an error contacting the Calendar service: ' + err);
      return;
    }
    console.log('Event created: %s', event.htmlLink);
  });
}

module.exports.authorize = authorize;
module.exports.listEvents = listEvents;
module.exports.createEvent = createEvent;
module.exports.getEvent = getEvent;
