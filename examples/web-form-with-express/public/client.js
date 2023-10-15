// This file is run by the browser each time your view template is loaded


document.addEventListener('DOMContentLoaded', function() {
  var startDate = document.querySelector('#start_date');
  var today = new Date();
  var startDateInstance = M.Datepicker.init(startDate, {
    format: 'yyyy-mm-dd',
    defaultDate: today,
    setDefaultDate: true
  });

  var endDate = document.querySelector('#end_date');
  var monthLater = new Date();
  monthLater.setDate(today.getDate() + 30)
  var endDateInstance = M.Datepicker.init(endDate, {
    format: 'yyyy-mm-dd',
    defaultDate: monthLater,
    setDefaultDate: true
  });


  var selectElems = document.querySelectorAll('select');
  var selectInstances = M.FormSelect.init(selectElems, {});


});


/**
 * Define variables that reference elements included in /views/index.html:
 */

// Buttons
const getButton = document.getElementById("getItem")
const createReminder = document.getElementById("addReminder");
const attachReminder = document.getElementById("attachReminder");
// Forms
const recurrenceForm = document.getElementById("recurrenceForm")
const attachRemindersForm = document.getElementById("attach-reminders");
const recurrenceType = document.getElementById("recurrence_type")
const selectDays = document.getElementById("select_days")
const reminderContainer = document.getElementById('reminders');
const attachReminderContainer = document.getElementById('attach-reminder-container');
// Loading
const loadingIcon = document.getElementById('loading');
// Response data
const responseElement = document.getElementById("results")

/**
 * Functions to handle appending new content to /views/index.html
 */



function createReminderRow(container) {
  const row = document.createElement('div');
  row.classList.add('row', 'reminder-row');
  const col = document.createElement('div');
  col.classList.add("col", "s6", "input-field");
  row.appendChild(col);
  const input = document.createElement('input');
  input.classList.add('reminderInput')
  input.setAttribute('type', 'text');
  const label = document.createElement('label');
  label.appendChild(document.createTextNode("Minutes before"))
  col.appendChild(input);
  col.appendChild(label);
  container.appendChild(row);

  const buttonCol = document.createElement('div');
  buttonCol.classList.add("col", "s3", "valign-wrapper");
  row.appendChild(buttonCol);
  const removeButton = document.createElement('button');
  removeButton.setAttribute('type', 'button');
  removeButton.appendChild(document.createTextNode("Remove"))

  buttonCol.appendChild(removeButton);
  removeButton.onclick = function (event) {
    console.log(removeButton.parentNode.parentNode.remove());
  }

}
// Appends the API response to the UI
const appendApiResponse = function (apiResponse, el) {
  console.log(apiResponse)

  // Add success message to UI
  const newParagraphSuccessMsg = document.createElement("p")
  newParagraphSuccessMsg.innerHTML = "Result: " + apiResponse.message
  el.appendChild(newParagraphSuccessMsg)
  // See browser console for more information
  if (apiResponse.message === "error" || apiResponse.message === "failed") {
    console.log("this is error");
    const newParagraphId = document.createElement("p")
    newParagraphId.innerHTML = "Error message: " + JSON.stringify(apiResponse.data)
    el.appendChild(newParagraphId);
  }

  // Add URL of Notion item (db, page) to UI
  if (apiResponse.data.url) {
    const newAnchorTag = document.createElement("a")
    newAnchorTag.setAttribute("href", apiResponse.data.url)
    newAnchorTag.innerText = apiResponse.data.url
    el.appendChild(newAnchorTag)
  }
  loadingIcon.classList.add('hide')
}

// Appends the blocks API response to the UI
const appendBlocksResponse = function (apiResponse, el) {
  console.log(apiResponse)

  // Add success message to UI
  const newParagraphSuccessMsg = document.createElement("p")
  newParagraphSuccessMsg.innerHTML = "Result: " + apiResponse.message
  el.appendChild(newParagraphSuccessMsg)

  // Add block ID to UI
  const newParagraphId = document.createElement("p")
  newParagraphId.innerHTML = "ID: " + apiResponse.data.results[0].id
  el.appendChild(newParagraphId)
}


/**
 * 
 * @param {REMINDERS FORM } event 
 * @returns 
 */

attachRemindersForm.onsubmit = async function (event) {
  event.preventDefault()
  loadingIcon.classList.remove('hide');

  // get ID from URL
  let parentTaskId;
  const idRegEx = new RegExp('[a-zA-Z0-9]{32}');
  const idMatch = event.target.reminder_task_id.value.match(idRegEx)
  if (idMatch) {
      parentTaskId = idMatch[0];
  } else {
      appendApiResponse({message: "failed", data:"Task ID must be 32 character alphanumeric string"}, responseElement);
      return;
  }

  const reminderInputs = attachRemindersForm.querySelectorAll('.reminderInput')
  const reminderTimes = Array.from(reminderInputs)
    .filter(input => Number.isInteger(parseInt(input.value)))
    .map(input => parseInt(input.value))

    console.log(reminderTimes);


  if (reminderInputs.length !== reminderTimes.length) {
      appendApiResponse({message: "failed", data:"Minutes before must be an integer value"}, responseElement);
      return;
  }


  const body = JSON.stringify({ parentTaskId, reminderTimes })
  console.log(body);
  const attachRemindersResponse = await fetch("/attachReminders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body
  });

  // post-response processing
  const attachRemindersData = await attachRemindersResponse.json()
  loadingIcon.classList.add('hide');
  appendApiResponse(attachRemindersData, responseElement)




}
/**
 * Attach submit event handlers to each form included in /views/index.html
 */

recurrenceType.onchange = function (event) {
  if (event.target.value === 'Custom') {
    selectDays.classList.remove('hide');
    selectDays.classList.add('show');
    console.log(selectDays.classList);
  } else if (event.target.value === 'Daily') {
    selectDays.classList.remove('show');
    selectDays.classList.add('hide');
    selectDays.selectedIndex = -1;
  }


}

recurrenceForm.onsubmit = async function (event) {
  event.preventDefault()
  loadingIcon.classList.remove('hide');

  // get ID from URL
  let parentTaskId;
  const idRegEx = new RegExp('[a-zA-Z0-9]{32}');
  const idMatch = event.target.task_id.value.match(idRegEx)
  if (idMatch) {
      parentTaskId = idMatch[0];
  } else {
      appendApiResponse({message: "failed", data:"Task ID must be 32 character alphanumeric string"}, responseElement);
      return;
  }

  const recurrenceType = event.target.recurrence_type.value;
  const startTime = event.target.start_time.value
  const endTime = event.target.end_time.value
  const startDate = event.target.start_date.value
  const endDate = event.target.end_date.value
  const recurrenceDays = Array.from(selectDays.querySelectorAll("option:checked")).map(option => option.value);

  // prepare reminders
  const reminderInputs = document.querySelectorAll('.reminderInput')
  const reminderTimes = Array.from(reminderInputs)
    .filter(input => Number.isInteger(parseInt(input.value)))
    .map(input => parseInt(input.value))

  
  
  if (reminderInputs.length !== reminderTimes.length) {
      appendApiResponse({message: "failed", data:"Minutes before must be an integer value"}, responseElement);
      return;
  }

  // validations
  const timeRegExp = new RegExp('^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$')
  if (!timeRegExp.test(startTime) || !timeRegExp.test(endTime)) {
    appendApiResponse({message: "failed", data:"time must be in the format HH:mm"}, responseElement);
    return;
  }

  // prepare body
  const body = JSON.stringify({ parentTaskId, recurrenceType, startTime, endTime, startDate, endDate, recurrenceDays, reminderTimes})
  console.log(body);

  // API call
  const recurrentTasksResponse = await fetch("/recurrentTasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body
  });

  // post-response processing
  const recurrentTasksData = await recurrentTasksResponse.json()
  loadingIcon.classList.add('hide');
  appendApiResponse(recurrentTasksData, responseElement)
}

// getButton.onclick = async function (event) {
//   console.log("I was clicked, bro");

//   const request = { itemId: "68a4d1a9-c8d0-41cc-b5ef-d7c0689bd790" }
//   const getItemResponse = await fetch("/test", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(request)
//   })

//   const getItemData = await getItemResponse.json()
//   appendApiResponse(getItemData, dbResponseEl)
// }

createReminder.onclick = function (event) {
  console.log("hey");
  event.preventDefault();
  createReminderRow(reminderContainer);
}

attachReminder.onclick = function (event) {
  console.log("attaching reminder");
  event.preventDefault();
  createReminderRow(attachReminderContainer);
}