// YOUR CODE HERE:
var app = {
  init: function() {
    this.friends = {};
    this.fetch();
    console.log('hi');
    $(document).on('click', '.username', function() { 
      app.addFriend($(this)[0].innerText.substring(1));
    });

    $(document).on('submit', '#postMessage', function(e) {
      e.preventDefault();
      var body = $(this).find('input[name="message"]').val();
      app.addMessage(body);
    });
  },

  server: 'https://api.parse.com/1/classes/messages',

  send: function(message) {
    $.ajax({
      url: this.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function(data) {
        console.log('sent', data);
      },
      error: function(data) {
        console.error('chatterbox: Failed to send message', data);
      }
    });
  },

  fetch: function() {
    // TODO: only add newest; or add to top rather than compounding
    // app.clearMessages();
    $.ajax({
      url: this.server,
      type: 'GET',
      success: function(data) {
        for (var i = 0; i < 30; i++) {
          if (!data.results[i].username || !data.results[i].text) {
            continue;
          }
          var cleanUser = data.results[i].username.replace(/(<([^>]+)>)/ig, ""); 
          var cleanText = data.results[i].text.replace(/(<([^>]+)>)/ig, ""); 
          if (app.friends.hasOwnProperty(cleanUser)) {
            $('#chats').append(
              '<div class="chat">' + 
              '<a href="#" class="username">@' + cleanUser + '</a>' + 
              '<p><b>' + cleanText + '</b></p></div>');
          } else {
            $('#chats').append(
              '<div class="chat">' + 
              '<a href="#" class="username">@' + cleanUser + '</a>' + 
              '<p>' + cleanText + '</p></div>');
          }
        } 
      },
      error: function(data) {
        console.error('chatterbox: Failed to fetch messages', data);
      }
    });
  },
 
  clearMessages: function() {
    $('#chats').empty();
  },

  addMessage: function(message) {
    var currentUsername = window.location.search.substring(10); 
    var roomName = 'stuff';
    var sendMessage = {
      username: currentUsername,
      text: message,
      roomname: roomName
    };
    this.send(sendMessage);
  },

  addRoom: function(roomName) {
    $('#roomSelect').append('<p>' + roomName + '</p>');
  },

  addFriend: function(user) {
    if (!app.friends.hasOwnProperty(user)) {
      app.friends[user] = user;
      console.log(app.friends[user]);
      app.fetch();
    }
  },

  handleSubmit: function() {}
};

app.init();

app.fetch();
setInterval(function() {
  app.fetch();  
}, 3000);







































