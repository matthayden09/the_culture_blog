$(document).ready(() => {

  var bodyInput = $("#body");
  var titleInput = $("#title");
  var cmsForm = $("#cms");
  var postCategorySelect = $("#list-category");
  var blogContainer = $("#blog-container");
  var healthContainer = $('#health-container')
  var movieContainer = $('#movie-container')
  var techContainer = $('#tech-container')
  var musicContainer = $('#music-container')
  var author;
  var post;

  $.get("/api/user_data", data => {
    console.log(data)
    author = data.id
  })


  $(document).on("click", "button.delete", postDelete)

  //retrieve post by catagory from models 
  function getPost(category) {
    var string = category || "";
    if (string) {
      string = "/category/" + string
    }
    $.get("/api/posts" + string, data => {
      console.log("post ", data)
      post = data
      if (!post || !post.length) {
        displayEmpty();
      } else {
        initialize();
      }
    })
  }

  getPost()


  function deletePost(id) {
    $.ajax({
      method: "DELETE",
      url: "/api/posts/" + id
    })
      .then(function () {
        getPost()
      })
  }

  // grab post array and render a new post card 
  function initialize() {
    blogContainer.empty();
    healthContainer.empty();
    movieContainer.empty();
    techContainer.empty();
    musicContainer.empty();

    let moviepostAdd = [];
    let musicpostAdd = [];
    let healthpostAdd = [];
    let techpostAdd = [];
    var postAdd = [];
    for (var i = 0; i < post.length; i++) {

      let currentPost = post[i]
      let currentCat = currentPost.category
      if (currentCat == 'Movies') {
        moviepostAdd.push(createPost(post[i]))
        movieContainer.append(moviepostAdd)
        console.log('movies')
      } else if (currentCat == 'Music') {
        musicpostAdd.push(createPost(post[i]))
        musicContainer.append(musicpostAdd)
        console.log('Music')
      } else if (currentCat == 'Health') {
        healthpostAdd.push(createPost(post[i]))
        healthContainer.append(healthpostAdd)
        console.log('Health')    // postAdd.push(createPost(post[i]))

      } else {
        techpostAdd.push(createPost(post[i]))
        techContainer.append(techpostAdd)
        console.log('Health')    // postAdd.push(createPost(post[i]))

      }

      // blogContainer.append(postAdd);
    }
  }

  // render post card 

  function createPost(post) {
    const postCard = $("<div>");
    postCard.addClass("card");
    const postCardHeading = $("<div>");
    postCardHeading.addClass("card-header");
    const deleteBtn = $("<button>");
    deleteBtn.text("delete article");
    deleteBtn.addClass("delete btn btn-danger");
    deleteBtn.css({
      "margin-top": "5px"
    });
    const editBtn = $("<button>");
    editBtn.text("Edit article");
    editBtn.addClass("edit btn btn-secondary");
    editBtn.css({
      "margin-left": "5px",
      "margin-top": "5px"
    });
    const postTitle = $("<h3>");
    const postDate = $("<small>");
    const postCardBody = $("<div>")
    postCardBody.addClass("card-body");
    const postBody = $("<p>");
    postTitle.text(post.title + "");
    postBody.text(post.body);
    const formatDate = new Date(post.createdAt).toLocaleDateString();
    postDate.text(formatDate);
    postCardHeading.append(postTitle);
    postCardBody.append(postBody);
    postCard.append(postCardHeading);
    postCard.append(postDate);
    postCard.append(postCardBody);
    const likeBtn = $("<button>");
    likeBtn.text("Like");
    likeBtn.addClass("btn-primary")
    postCardBody.append(likeBtn)
    const commentBtn = $("<button>");
    commentBtn.text("Comment");
    commentBtn.addClass("btn-info");
    commentBtn.css({
      "margin-left": "5px",
      "margin-bottom": "10px"
    });
    postCardBody.append(commentBtn)
    postCard.append(deleteBtn);
    postCard.append(editBtn);
    postCard.data("post", post);
    const commentHeading = $("<h4>Comments</h4>");
    commentHeading.addClass("comments-heading");
    postCardBody.append(commentHeading);
    const comments = $("<textArea>");
    comments.addClass("comments-section");
    postCardBody.append(comments);

    const lineBreak = $("<hr>")
    postCardBody.append(lineBreak)

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

  // user submit new post 
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

  // once submited refresh the page 
  function submitPost(Post) {
    $.post("/api/posts/", Post, function () {
      window.location.href = "/members";
    });
  }

  function postDelete() {
    var currentPost = $(this)
      .parent()
      .data("post");
    console.log(currentPost.UserId)
    if (author === currentPost.UserId) {
      deletePost(currentPost.id)
    } else {
      console.log("test")
    }
  }

  $.get("/api/user_data").then(data => {
    $(".member-name").text(data.email);
    var name = data.email;

    // chat 
    const socket = io.connect("http://localhost:8080");
    const messageContainer = document.getElementById("message-container")
    const messageForm = document.getElementById("send-container")
    const messageInput = document.getElementById("message-input")

    socket.emit("new-user", name);

    socket.on("user-disconnect", name => {
      appendMessage(`${name} disconnected`)
    })

    socket.on("user-connected", name => {
      appendMessage(`${name} connected`)
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

 