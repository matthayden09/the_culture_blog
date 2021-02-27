$(document).ready(() => {
  // This file just does a GET request to figure out which user is logged in
  // and updates the HTML on the page

  var bodyInput = $("#body");
  var titleInput = $("#title");
  var cmsForm = $("#cms");
  var postCategorySelect = $("#list-category");
  var blogContainer = $(".blog-container");
  var author;
  var post;
  var authorPost;

$.get("/api/user_data", data => {
  console.log(data)
  author = data.id
})

// $.get("/api/posts/", data => {
//   console.log(data)
  
// })


  $(document).on("click", "button.delete", postDelete)


  //retrieve post by catagory from models 
  function getPost(category){ 
    var string = category || "";
    if(string){
      string = "/category/" + string
    }
    $.get("/api/posts" + string, data => {
      console.log("post ", data)
      post = data
      if(!post || !post.length){
        displayEmpty();
      } else {
        initialize();
      }
    })
  }

  getPost()


  function deletePost(id){
    $.ajax({
      method: "DELETE",
      url: "/api/posts/" + id
    })
    .then(function(){
      getPost()
    })
  }

  // grab post array and render a new post card 
  function initialize(){
    blogContainer.empty();
    var postAdd = [];
    for(var i = 0; i < post.length; i++){
      postAdd.push(createPost(post[i]))
    }
    blogContainer.append(postAdd);
  }

  // render post card 
  function createPost(post){
    const postCard = $("<div>");
    postCard.addClass("card");
    postCard.attr("author", post.UserId)
    const postCardHeading = $("<div>");
    postCardHeading.addClass("card-header");
    const deleteBtn = $("<button>");
    deleteBtn.text("delete");
    deleteBtn.addClass("delete btn btn-danger");
    const editBtn = $("<button>");
    editBtn.text("Edit");
    editBtn.addClass("edit btn btn-default");
    const postTitle = $("<h2>");
    const postDate = $("<small>");
    const postCatogory = $("<h5>");
    postCatogory.text(post.category);
    postCatogory.css({
      float: "right",
      "font-weight": "700",
      "margin-top":
      "-15px"
    });
    const postCardBody = $("<div>")
    postCardBody.addClass("card-body");
    const postBody = $("<p>");
    postTitle.text(post.title + "");
    postBody.text(post.body)
    const formatDate = new Date(post.createdAt).toLocaleDateString();
    postDate.text(formatDate);
    postTitle.append(postDate);
    postCardHeading.append(deleteBtn);
    postCardHeading.append(editBtn);
    postCardHeading.append(postTitle);
    postCardHeading.append(postCatogory);
    postCardBody.append(postBody);
    postCard.append(postCardHeading);
    postCard.append(postCardBody);
    postCard.data("post", post);
    return postCard
  }




  // function for no post 
  function displayEmpty() {
    blogContainer.empty();
    var messageH2 = $("<h2>");
    messageH2.css({ "text-align": "center", "margin-top": "50px" });
    messageH2.html("No posts yet for this category, navigate here in order to create a new post.");
    blogContainer.append(messageH2);
  }



  
  postCategorySelect.val("Personal");


  //user submit new post 
  $(cmsForm).on("submit", function handleFormSubmit(event) {
    event.preventDefault();
  
    if (!titleInput.val().trim() || !bodyInput.val().trim()) {
      return;
    }
    
    var newPost = {
      title: titleInput.val().trim(),
      body: bodyInput.val().trim(),
      category: postCategorySelect.val()
    };

    console.log(newPost);
    submitPost(newPost)

  });

  //once submited refresh the page 
  function submitPost(Post) {
    $.post("/api/posts/", Post, function() {
      window.location.href = "/members";
    });
  }

    function postDelete(){
      var currentPost = $(this)
      .parent()
      .parent()
      .data("post");
      console.log(currentPost.UserId)
      if(author === currentPost.UserId){
      deletePost(currentPost.id)
    } else {
      console.log("test")
    }

    }

    


  $.get("/api/user_data").then(data => {
    $(".member-name").text(data.email);
    var name = data.email;

    const socket = io.connect("http://localhost:8080", { transport : ['websocket'] });
    const messageContainer = document.getElementById("message-container")
    const messageForm = document.getElementById("send-container")
    const messageInput = document.getElementById("message-input")


    

    socket.emit("new-user", name);

  

    socket.on("user-disconnect", name => {
      appendMessage(`${name} disconnected`)
    })

    socket.on("chat-message", data => {
      appendMessage(`${data.name}: ${data.message}`)
    })  
    
    socket.on("user-connected", name => {
      appendMessage(`${name} connected`)
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
