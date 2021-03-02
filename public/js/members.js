$(document).ready(() => {
  //Establish variables 
  var bodyInput = $("#body");
  var titleInput = $("#title");
  var cmsForm = $("#cms");
  var postCategorySelect = $("#list-category");
  var blogContainer = $("#blog-container");
  var healthContainer = $('#health-container');
  var movieContainer = $('#movie-container');
  var techContainer = $('#tech-container');
  var musicContainer = $('#music-container');
  var author;
  var post;
  var blogId;
  var update = false;

  //Grasp Author id
  $.get("/api/user_data", data => {
    console.log(data);
    author = data.id;
  });

  //Delete onClick 
  $(document).on("click", "button.delete", postDelete);
  //Edit post
  $(document).on("click", "button.edit", postEdit);

  //Grab post form api route 
  function getPost() {
    $.get("/api/posts", data => {
      console.log("post ", data);
      post = data;
      if (post) {
        initialize()
      };
    });
  };

  getPost();

  //Delete post from api
  function deletePost(id) {
    $.ajax({
      method: "DELETE",
      url: "/api/posts/" + id
    })
      .then(function () {
        getPost();
      });
  };

  //Update post to api
  function editPost(index) {
    $.ajax({
      method: "PUT",
      url: "/api/posts/",
      data: index
    })
      .then(function () {
        getPost();
      });
  };



  //Post by category
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

      let currentPost = post[i];
      let currentCat = currentPost.category;
      if (currentCat == 'Movies') {
        moviepostAdd.push(createPost(post[i]));
        movieContainer.append(moviepostAdd);
        console.log('movies');
      } else if (currentCat == 'Music') {
        musicpostAdd.push(createPost(post[i]));
        musicContainer.append(musicpostAdd);
        console.log('Music')
      } else if (currentCat == 'Health') {
        healthpostAdd.push(createPost(post[i]));
        healthContainer.append(healthpostAdd);
        console.log('Health');    // postAdd.push(createPost(post[i]))
      } else {
        techpostAdd.push(createPost(post[i]));
        techContainer.append(techpostAdd);
        console.log('Health');    // postAdd.push(createPost(post[i]))
      };
      // blogContainer.append(postAdd);
    };
  };


  //Create post card
  function createPost(post) {
    const postCard = $("<div>")
      .addClass("card");

    const postCardHeading = $("<div>")
      .addClass("card-header");
    //Delete button 
    const deleteBtn = $("<button>")
      .text("delete article")
      .addClass("delete btn btn-danger")
      .css({
        "margin-top": "5px"
      });
    //Edit button
    const editBtn = $("<button>")
      .text("Edit article")
      .addClass("edit btn btn-secondary")
      .css({
        "margin-left": "5px",
        "margin-top": "5px"
      });

    const postTitle = $("<h3>");
    const postDate = $("<small>");

    const postCardBody = $("<div>")
      .addClass("card-body");
    //Body
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
    //Like Button
    const likeBtn = $("<button>")
      .text("Like")
      .addClass("btn-primary");
    postCardBody.append(likeBtn);
    //Comment button
    const commentBtn = $("<button>")
      .text("Comment")
      .addClass("btn-info")
      .css({
        "margin-left": "5px",
        "margin-bottom": "10px"
      });
    postCardBody.append(commentBtn);
    postCard.append(deleteBtn);
    postCard.append(editBtn);
    postCard.data("post", post);
    //Comment heading 
    const commentHeading = $("<h4>")
      .text("Comments")
      .addClass("comments-heading");
    postCardBody.append(commentHeading);
    //Comment textarea 
    const comments = $("<textArea>")
      .addClass("comments-section");
    postCardBody.append(comments);
    //Line break
    const lineBreak = $("<hr>");
    postCard.append(lineBreak);
    //Like button counter
    let likes = 0;
    likeBtn.click(function () {
      likes++
      likeBtn.text(likes + " likes");
    });

    return postCard;
  };

  //Submit new post 
  $(cmsForm).on("submit", function handleFormSubmit(event) {
    event.preventDefault();
    if (!titleInput.val().trim() || !bodyInput.val().trim()) {
      return;
    };
    var newPost = {
      title: titleInput.val().trim(),
      body: bodyInput.val().trim(),
      category: postCategorySelect.val()
    };

    if (update) {
      newPost.id = blogId;
      editPost(newPost);
      bodyInput.val("");
      titleInput.val("");
      update = false;
    } else {
      console.log(newPost);
      submitPost(newPost)
    };
  });

  //Refresh the page once submitted
  function submitPost(Post) {
    $.post("/api/posts/", Post, function () {
      window.location.href = "/members";
    });
  };

  //Delete post 
  function postDelete() {
    var currentPost = $(this)
      .parent()
      .data("post");
    console.log(currentPost.UserId)
    if (author === currentPost.UserId) {
      deletePost(currentPost.id)
    } else {
      console.log("test")
    };
  };

  //Edit post 
  function postEdit() {
    var currentPost = $(this)
      .parent()
      .data("post");

    blogId = currentPost.id;
    console.log(blogId);
    if (author === currentPost.UserId) {
      var newPost = {
        title: titleInput.val(currentPost.title),
        body: bodyInput.val(currentPost.body),
        category: postCategorySelect.val(currentPost.category)
      };
      update = true

    } else {
      console.log("test")
    };
  };

  //Socket.io and client email info
  $.get("/api/user_data").then(data => {
    $(".member-name").text(data.email);
    var name = data.email;

    // chat 
    const socket = io.connect("https://gentle-cliffs-54160.herokuapp.com/");
    const messageContainer = $("#message-container");
    const messageForm = $("#send-container");
    const messageInput = $("#message-input");

    socket.emit("new-user", name);
    //User disconnected 
    socket.on("user-disconnect", name => {
      appendMessage(`${name} disconnected`)
    });
    //User connected 
    socket.on("user-connected", name => {
      appendMessage(`${name} connected`)
    });
    //chat 
    socket.on("chat-message", data => {
      appendMessage(`${data.name}: ${data.message}`)
    });
    //Submit chat
    messageForm.on("submit", e => {
      e.preventDefault()
      const message = messageInput.val()
      appendMessage(`You: ${message}`)
      socket.emit("send-chat-message", message)
      messageInput.val("")
    });
    //Append chat to message div
    function appendMessage(message) {
      const messageElement = $("<div>")
      messageElement.html(message)
      messageContainer.append(messageElement)
    };

    appendMessage("Welcome!");

  });
});
