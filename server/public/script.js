// Front End //
const msgerForm = document.querySelector(".msger-inputarea");
const msgerInput = document.querySelector(".msger-input");
const msgerChat = document.querySelector(".msger-chat");

msgerForm.addEventListener("submit", event => {
  event.preventDefault();

  const msgText = msgerInput.value;
  if (!msgText) return;

  appendMessage("right", msgText);
  msgerInput.value = "";

  botResponse();
});

function appendMessage(side, text) {
  //   Simple solution for small apps
  const msgHTML = `
    <div class="msg ${side}-msg">

      <div class="msg-bubble">
        <div class="msg-text">${text}</div>
      </div>
    </div>
  `;

  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollTop += 500;
}

function botResponse() {
  const msgText = "This is the response text";
  const delay = msgText.split(" ").length * 100;

  setTimeout(() => {
    appendMessage("left", msgText);
  }, delay);
}






// client-side js, loaded by index.html
// run by the browser each time the page is loaded

// define variables that reference elements on our page
const messageList = document.getElementById("dreams");
const messageForm = document.querySelector("form");
const channel = "some@user.com";
const userId = "123abc";
const userName = "Some User";

function makeMessage(messageText) {
  return {
    channel: {
      id: channel
    },
    from: {
      id: userId,
      name: userName
    },
    message: { text: messageText },
    metadata: {
      origin: window.location.href
    }
  };
}

function sendNewMessage(message) {
  const payload = makeMessage(message);
  const opts = {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json"
    }
  };
  return fetch("/message", opts).then(() => payload);
}

function formatMessage(payload, from) {
  const message = JSON.stringify(payload.message.text || payload.message).replace(/(\\n)+/,"<br/>");
  let formatted = `<span class='${from}'>${from}: </span><span class='message'>${message}</span>`;
  if (payload.options && payload.options.choices_message) {
    formatted += `<br/><div class='choices'>${payload.options.choices_message}</div>`
  }
  return formatted;
}

function appendNewMessage(data) {
  const message = data.message;
  if (!message.message || message.message_type === "action") {
    return;
  }
  const newListItem = document.createElement("p");
  newListItem.innerHTML = formatMessage(message, data.from);
  messageList.appendChild(newListItem);
}

function resetMessages() {
  return fetch("/reset");
}

function getMessages() {
  return fetch("/messages")
    .then(response => response.json())
    .then(data => data.messages);
}

function displayMessages(messages) {
  messageList.innerHTML = "";
  messages.forEach(appendNewMessage);
}

// fetch the initial list of dreams
fetch("/messages")
  .then(response => response.json()) // parse the JSON from the server
  .then(data => {
    // remove the loading text
    messageList.firstElementChild.remove();

    // iterate through every dream and add it to our page
    data.messages.forEach(appendNewMessage);

    //set a timer to continuously fetch new messages
    setInterval(() => getMessages().then(displayMessages), 250);
    
    // listen for the form to be submitted and add a new dream when it is
    messageForm.addEventListener("submit", event => {
      // stop our form submission from refreshing the page
      event.preventDefault();

      // get dream value and add it to the list
      let newMessage = messageForm.elements.dream.value;

      sendNewMessage(newMessage).then(message => {
        appendNewMessage(message);

        // reset form
        messageForm.reset();
        messageForm.elements.dream.focus();
      });
    });
  });