$(document).ready(() => {
  // This file just does a GET request to figure out which user is logged in
  // and updates the HTML on the page
  $.get("/api/user_data").then(data => {
    $(".member-name").text(data.email);
    var name = data.email;

    const socket = io.connect("http://localhost:8080");
    const messageContainer = document.getElementById("message-container")
    const messageForm = document.getElementById("send-container")
    const messageInput = document.getElementById("message-input")


    

    socket.emit("new-user", name);

    socket.on("user-connected", name => {
      appendMessage(`${name} connected`)
    })

    socket.on("user-disconnected", name => {
      appendMessage(`${name} disconnected`)
    })

    socket.on("chat-message", data => {
      appendMessage(`${data.name}: ${data.message}`)
    })

    messageForm.addEventListener("submit", e => {
      e.preventDefault()
      const message = messageInput.value;
      appendMessage(`You: ${message}`)
      socket.emit("send-chat-message", message)
      messageInput.value = ""
    })

    function appendMessage(message) {
      const messageElement = document.createElement("div")
      messageElement.innerHTML = message;
      messageContainer.append(messageElement)
    }

    appendMessage("you joined");

  });
});
