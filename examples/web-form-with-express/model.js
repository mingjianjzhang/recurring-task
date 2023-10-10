class Task {
    constructor(title, parentTaskId) {
        this.title = title;
        this.parentTaskId = parentTaskId;
    }

    toJsonSchema(startDate, endDate) {
        const schema = {
          Task: {
            title: [
              {
                text: {
                  content: this.title + ` ${startDate.getMonth() + 1}/${startDate.getDate()}`,
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
          "Due": {
            date: {
              "start": startDate.toISOString(),
              "end": endDate.toISOString()
            }
          },
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

module.exports.Task = Task