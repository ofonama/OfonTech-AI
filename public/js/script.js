const userReq = document.getElementById("userReq");
const sendRequest = document.getElementById("sendRequest");
const responseDiv = document.getElementById("response");

sendRequest.disabled = true;

async function getChat() {
  const chat = await fetch("/messages");
  return chat.json();
}

/*
  Create a message bubble
*/
function createMessage(role, content) {
  const messageDiv = document.createElement("div");

  messageDiv.classList.add("message");

  if (role === "user") {
    messageDiv.classList.add("user-message");
  } else {
    messageDiv.classList.add("ai-message");
  }

  messageDiv.innerHTML = marked.parse(content);

  responseDiv.appendChild(messageDiv);

  // Automatically scroll to the newest message
  messageDiv.scrollIntoView({
    behavior: "smooth",
    block: "end",
  });
}

/*
  Load previous chat messages
*/
getChat().then((chat) => {
  chat.forEach((message) => {
    if (message.role === "user") {
      createMessage("user", message.content);
    } else if (message.role === "assistant") {
      createMessage("assistant", message.content);
    }
  });
});

/*
  Enable/disable Ask button
*/
userReq.addEventListener("input", () => {
  const ur = userReq.value.trim();

  sendRequest.disabled = ur === "";
});

/*
  Send message
*/
async function sendMessage() {
  const userMessage = userReq.value.trim();

  if (userMessage === "") {
    return;
  }

  sendRequest.disabled = true;

  // Display user's message immediately
  createMessage("user", userMessage);

  // Clear textarea
  userReq.value = "";

  try {
    const response = await fetch("/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_req: userMessage,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      createMessage("assistant", data.reply);
    } else {
      createMessage(
        "assistant",
        "Sorry, an error occurred while fetching the response.",
      );
    }
  } catch (error) {
    console.error(error);

    createMessage(
      "assistant",
      "Something went wrong while connecting to the server.",
    );
  }

  // Re-enable button if textarea has content
  sendRequest.disabled = userReq.value.trim() === "";
}

/*
  Clicking the Ask button
*/
sendRequest.addEventListener("click", (e) => {
  e.preventDefault();
  sendMessage();
});

/*
  Pressing Enter in the textarea
*/
userReq.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
