class Task {
    constructor(title, parentTaskId) {
        this.title = title;
        this.parentTaskId = parentTaskId;
    }

    toJsonSchema(startTime, endTime) {

        this.startTime = startTime;
        this.endTime = endTime;

        let dateSchema;
        if (endTime !== null) {
          dateSchema = {
            date: {
              "start": startTime.toISOString(),
              "end": endTime.toISOString()
            }
          }
        } else {
          dateSchema = {
            date: {
              "start": startTime.toISOString()
            }
          }
        }


        const schema = {
          Task: {
            title: [
              {
                text: {
                  content: this.title + ` ${startTime.getMonth() + 1}/${startTime.getDate()}`,
                },
              },
            ],
          },
          "Parent Task": {
            relation: [
              {
                  "id": this.parentTaskId
              }
           ] 
          },
          "Due": dateSchema,
          "Kanban Status": {
            "type": "select",
            "select": {
                "id": "2cc623d0-c50b-48d9-a6f8-d508e2d534d3",
                "name": "To Do",
                "color": "red"
            }
          },
          "Priority": {
            "type": "select",
            "select": {
                "id": "0ff3e4b4-0148-4bf3-8d44-f3e16d68ea2c",
                "name": "🧀 Medium",
                "color": "green"
            }
        },

        }
        return schema;
    }
}

class Event {
  constructor(title, description, startTime, endTime, remindBeforeMinutes) {
    this.title = title;
    this.description = description;
    this.startTime = startTime;
    this.endTime = endTime;
    this.remindBeforeMinutes = remindBeforeMinutes;
  }

  toJsonSchema() {
    const event = {
      'summary': this.title,
      'description': this.description,
      'start': {
        'dateTime': this.startTime,
        'timeZone': 'America/Los_Angeles'
      },
      'end': {
        'dateTime': this.endTime,
        'timeZone': 'America/Los_Angeles'
      },
      'reminders': {
        'useDefault': false,
        'overrides': [
          {'method': 'popup', 'minutes': this.remindBeforeMinutes }
        ]
      }
    }
  }

}

const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

module.exports.Task = Task
module.exports.Event = Event
module.exports.dayMap = dayMap;