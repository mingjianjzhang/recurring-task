require("dotenv").config()
const express = require("express")
const app = express()

const { Client } = require("@notionhq/client")
const { Task } = require('./model.js')
const notion = new Client({ auth: process.env.NOTION_KEY })

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"))
app.use(express.json()) // for parsing application/json

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + "/views/index.html")
})

app.post("/recurrentTasks", async function (request, response) {
  const { parentTaskId, recurrenceType, startTime, endTime, startDate, endDate, recurrenceDays } = request.body

  let parentTaskName = '';
  let databaseId = '';
  let parentTask;
  // get name of parent task
  try {
    parentTask = await notion.pages.retrieve({page_id: parentTaskId});
    databaseId = parentTask.parent.database_id;
    const parentTaskTitle = parentTask.properties['Task'].title.find(taskInfo => {
      return taskInfo.type == 'text';
    })
    parentTaskName = parentTaskTitle.plain_text;
  } catch (error) {
    console.log(error);
    response.json({message: "error", data: error})
  }

  const subTask = new Task(parentTaskName, parentTaskId);
  let dateString;
  let recurStartTime;
  let recurEndTime;

  if (startTime) {
    if (!endTime) {
      response.json({message: "error", data: "Must specify End Time if Start Time is specified"})
    }
    dateString = startDate + "T" + startTime + ":00.000-07:00";
    recurStartTime = new Date(dateString);
    recurEndTime = new Date(dateString);
    const recurEndTimeSplit = endTime.split(':');
    recurEndTime.setHours(parseInt(recurEndTimeSplit[0]), parseInt(recurEndTimeSplit[1]));  
  } else {
    dateString = startDate
    recurStartTime = new Date(dateString);
  }
  // TODO: add validation if no endtime is specified


  const terminalDateString = endDate + "T" + "23:59:00.000-07:00";
  const terminalDate = new Date(terminalDateString);

  while (recurStartTime.getTime() < terminalDate.getTime()) {
    if (recurrenceType === 'Custom' && !recurrenceDays.includes(recurStartTime.getDay().toString())) {
      recurStartTime.setDate(recurStartTime.getDate() + 1);
      if (recurEndTime) {
        recurEndTime.setDate(recurEndTime.getDate() + 1);
      }
      continue;
    }

    try {
      // create a new sub-task under the Parent Task ID with the correct date.
      // Must also set the Priority and Kanban Status for it to appear on any of the views.

      const newItem = await notion.pages.create({
        parent: {
          type: "database_id",
          database_id: databaseId
        },
        properties: subTask.toJsonSchema(recurStartTime, recurEndTime)
      })
      console.log("created new item");
      console.log(newItem);
    } catch (error) {
      console.log(error);
    }
    recurStartTime.setDate(recurStartTime.getDate() + 1);
    if (recurEndTime) {
      recurEndTime.setDate(recurEndTime.getDate() + 1);
    }
  }

  response.json({"message": "nice"})  

  // if start time and end time are set, use both when setting the date. otherwise, you only need to
  // set a start date
})

// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port)
})
