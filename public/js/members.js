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
  var name;
  var commentInput;

  $.get("/api/user_data", data => {
    // console.log(data)
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
      // console.log("post ", data)
      post = data
      if (!post) {
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
    techContainer.empty()
    musicContainer.empty()

    let moviepostAdd = [];
    let musicpostAdd = [];
    let healthpostAdd = [];
    let techpostAdd = []
    var postAdd = []
    for (var i = 0; i < post.length; i++) {

      let currentPost = post[i]
      let currentCat = currentPost.category
      if (currentCat == 'Movies') {
        moviepostAdd.push(createPost(post[i]))
        movieContainer.append(moviepostAdd)
        // console.log('movies')
      } else if (currentCat == 'Music') {
        musicpostAdd.push(createPost(post[i]))
        musicContainer.append(musicpostAdd)
        // console.log('Music')
      } else if (currentCat == 'Health') {
        healthpostAdd.push(createPost(post[i]))
        healthContainer.append(healthpostAdd)
        // console.log('Health')    // postAdd.push(createPost(post[i]))

      } else {
        techpostAdd.push(createPost(post[i]))
        techContainer.append(techpostAdd)
        // console.log('Health')    // postAdd.push(createPost(post[i]))

      }

      // blogContainer.append(postAdd);
    }
  }

  // render post card 
  function createPost(post) {

    // variables
    const postCard = $("<div>");
    const postCardHeading = $("<div>");
    const postTitle = $("<h3>");
    const postAuthor = $("<p style='font-weight: bold'>");
    const postDate = $("<small>");
    const formatDate = new Date(post.createdAt).toLocaleDateString();
    const postCardBody = $("<div>")
    const postBody = $("<p>");
    const likeBtn = $("<button>");
    const commentHeading = $("<h4>Comments</h4>");
    const comments = $("<div>");
    const commentForm = $(
      `<form>
      <input type=text placeholder="Enter comment here">
      <button type="submit" class="comment btn-info">Comment</button>
      </form>`
    );
    const deleteBtn = $("<button>");
    const editBtn = $("<button>");
    const lineBreak = $("<hr>")

    // add class 
    postCard.addClass("card");
    postCardHeading.addClass("card-header");
    postCardBody.addClass("card-body");
    likeBtn.addClass("btn-primary")
    commentHeading.addClass("comments-heading");
    comments.addClass("comments-section");
    deleteBtn.addClass("delete btn btn-danger");
    editBtn.addClass("edit btn btn-secondary");

    // .text
    postTitle.text(post.title + "");
    postAuthor.text("Posted by: " + name + "");
    postDate.text(formatDate);
    postBody.text(post.body);
    likeBtn.text("Like");
    deleteBtn.text("delete article");
    editBtn.text("Edit article");

    // append elements
    postCardHeading.append(postTitle);
    postCardHeading.append(postAuthor);
    postCardBody.append(postBody);
    postCard.append(postCardHeading);
    postCard.append(postDate);
    postCard.append(postCardBody);
    postCardBody.append(likeBtn)
    postCard.append(deleteBtn);
    postCard.append(editBtn);
    postCardBody.append(commentHeading);
    postCardBody.append(commentForm);
    postCardBody.append(comments);
    postCard.append(lineBreak)

    // css
    deleteBtn.css({
      "margin-top": "15px"
    });
    editBtn.css({
      "margin-left": "5px",
      "margin-top": "15px"
    });

    // like button counter
    let likes = 0;
    likeBtn.click(function () {
      likes++
      likeBtn.text(likes + " likes");

    });

    // backup comment button
    // const commentBtn = $("<button>");
    // commentBtn.text("Comment");
    // commentBtn.addClass("comment btn-info");
    // commentBtn.css({
    //   "margin-left": "5px",
    //   "margin-bottom": "10px"
    // });

    // postCardBody.append(commentBtn)

    // add a comment
    function addComment() {
      const newComment = $(`<p>${name} commented: </p>`)
      console.log(newComment)
      comments.append(newComment)
    }

    $(document).on("click", "button.comment", addComment);
    
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

    // console.log(newPost);
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
    // console.log(currentPost.UserId)
    if (author === currentPost.UserId) {
      deletePost(currentPost.id)
    } else {
      // console.log("test")
    }
  }

  // chat 
  $.get("/api/user_data").then(data => {
    $(".member-name").text(data.email);
    name = data.email;

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
