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



  var timeElems = document.querySelectorAll('.timepicker');
  var timeInstances = M.Timepicker.init(timeElems, {
    duration: 300,
    twelveHour: false
  });
  var selectElems = document.querySelectorAll('select');
  var selectInstances = M.FormSelect.init(selectElems, {});


});
/**
 * Define variables that reference elements included in /views/index.html:
 */

// Buttons
const getButton = document.getElementById("getItem")
// Forms
const recurrenceForm = document.getElementById("recurrenceForm")
// Response data
const responseElement = document.getElementById("results")

/**
 * Functions to handle appending new content to /views/index.html
 */

// Appends the API response to the UI
const appendApiResponse = function (apiResponse, el) {
  console.log(apiResponse)

  // Add success message to UI
  const newParagraphSuccessMsg = document.createElement("p")
  newParagraphSuccessMsg.innerHTML = "Result: " + apiResponse.message
  el.appendChild(newParagraphSuccessMsg)
  // See browser console for more information
  if (apiResponse.message === "error") return

  // Add ID of Notion item (db, page, comment) to UI
  const newParagraphId = document.createElement("p")
  newParagraphId.innerHTML = "ID: " + apiResponse.data.id
  el.appendChild(newParagraphId)

  // Add URL of Notion item (db, page) to UI
  if (apiResponse.data.url) {
    const newAnchorTag = document.createElement("a")
    newAnchorTag.setAttribute("href", apiResponse.data.url)
    newAnchorTag.innerText = apiResponse.data.url
    el.appendChild(newAnchorTag)
  }
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
 * Attach submit event handlers to each form included in /views/index.html
 */

recurrenceForm.onsubmit = async function (event) {
  event.preventDefault()
  const parentTaskId = event.target.task_id.value;
  const recurrenceType = event.target.recurrence_type.value;
  const startTime = event.target.start_time.value
  const endTime = event.target.end_time.value
  const startDate = event.target.start_date.value
  const endDate = event.target.end_date.value

  const body = JSON.stringify({ parentTaskId, recurrenceType, startTime, endTime, startDate, endDate})
  console.log(body);
  const recurrentTasksResponse = await fetch("/recurrentTasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body
  });

  const recurrentTasksData = await recurrentTasksResponse.json()
  appendApiResponse(recurrentTasksData, responseElement)
}

getButton.onclick = async function (event) {
  console.log("I was clicked, bro");

  const request = { itemId: "68a4d1a9-c8d0-41cc-b5ef-d7c0689bd790" }
  const getItemResponse = await fetch("/getItem", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request)
  })

  const getItemData = await getItemResponse.json()
  appendApiResponse(getItemData, dbResponseEl)
}
