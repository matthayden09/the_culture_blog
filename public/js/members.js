$(document).ready(() => {
  // This file just does a GET request to figure out which user is logged in
  // and updates the HTML on the page
  $.get("/api/user_data").then(data => {
    $(".member-name").text(data.email);


    //socket.io client side

    //location of hosting the socket application
    const socket = io.connect("http://localhost:8080");

    //returning message containers elemets by id 
    const messageContainer = document.getElementById("message-container")
    const messageForm = document.getElementById("send-container")
    const messageInput = document.getElementById("message-input")

    var name = data.email;
    appendMessage("Welcome!");
    socket.emit("new-user", name);

    socket.on("chat-message", data => {
      appendMessage(`${data.name}: ${data.message}`)
    })

    socket.on("user-connected", name => {
      appendMessage(`${name} connected`)
    })

    socket.on("user-disconnected", name => {
      appendMessage(`${name} disconnected`)
    })


    //Submiting 
    messageForm.addEventListener("submit", e => {
      e.preventDefault()
      const message = messageInput.value;
      appendMessage(`You: ${message}`)
      //socket.io sending information from the client to the server. 
      socket.emit("send-chat-message", message)
      messageInput.value = ""
    })

    //Appending message to container 
    function appendMessage(message) {
      const messageElement = document.createElement("div")
      messageElement.innerHTML = message;
      messageContainer.append(messageElement)
    }



  });
});
