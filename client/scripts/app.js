// YOUR CODE HERE:
var app = {
  init: function() {
    this.friends = {};
    this.fetch();
    console.log('hi');
    $(document).on('click', '.username', function(e) { 
      e.preventDefault();
      app.addFriend($(this)[0].innerText.substring(1));
    });

    $(document).on('submit', '#postMessage', function(e) {
      e.preventDefault();
      var body = $(this).find('input[name="message"]').val();
      app.addMessage(body);
      app.fetch();
    });

    $(document).on('change', '#roomList', function() {
      // filter update for loops to only have $(this) roomnames

      var roomCheck = this.value;
      app.fetch(function(obj) {
        return obj.roomname === roomCheck;
      });
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

  fetch: function(predicate) {
    // TODO: only add newest; or add to top rather than compounding
    // app.clearMessages();
    $.ajax({
      url: this.server,
      type: 'GET',
      success: function(data) {
        app.update(data, predicate);
      },
      error: function(data) {
        console.error('chatterbox: Failed to fetch messages', data);
      }
    });
  },

  update: function(data, predicate) {
    var $chats = $('#chats');
    var cleanUsers = [];
    var cleanTexts = [];
    var rooms = [];

    // Sanitize user inputs for 30 most recent posts
    for (var i = 0; i < 30; i++) {
      if (predicate && !predicate(data.results[i])) { continue; }
      if (!data.results[i].username || !data.results[i].text || !data.results[i].roomname) { continue; }

      cleanUsers.push(data.results[i].username.replace(/(<([^>]+)>)/ig, "")); 
      cleanTexts.push(data.results[i].text.replace(/(<([^>]+)>)/ig, ""));
      rooms.push(data.results[i].roomname.replace(/(<([^>]+)>)/ig, ""));
    }

    $chats.html('');
    // Append sanitized user inputs to chats DOM element
    for (var i = 0; i < cleanUsers.length; i++) {
      if (app.friends.hasOwnProperty(cleanUsers[i])) {
        $('#chats').append(
          '<div class="chat">' + 
          '<a href="#" class="username">@' + cleanUsers[i] + '</a>' + 
          '<p><b>' + cleanTexts[i] + '</b></p></div>');
      } else {
        $('#chats').append(
          '<div class="chat">' + 
          '<a href="#" class="username">@' + cleanUsers[i] + '</a>' + 
          '<p>' + cleanTexts[i] + '</p></div>');
      }
    }

    // Add rooms to rooms dropdown
    var currentRoom = $('#roomList')[0].value || 'all';
    $('#roomList').html('<option value="' + currentRoom + '">' + currentRoom + '</option>');
    rooms = _.uniq(rooms, false);
    var option = '';
    for (var i = 0; i < rooms.length; i++) {
      option += '<option value="' + rooms[i] + '">' + rooms[i] + '</option>';
    }
    $('#roomList').append(option);
  },
 
  clearMessages: function() {
    $('#chats').empty();
  },

  addMessage: function(message) {
    var currentUsername = window.location.search.substring(10); 
    var roomName = $('#roomList')[0].value;
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









