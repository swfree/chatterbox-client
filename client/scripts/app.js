// YOUR CODE HERE:
var app = {
  server: 'https://api.parse.com/1/classes/messages',
  currentRoom: 'all',

  init: function() {
    // Initialize friends & call fetch once to fill page
    this.friends = {};
    this.fetch(function(obj) {
      return obj.roomname === app.currentRoom;
    });

    // Click handler for adding usernames to friends list
    $(document).on('click', '.username', function(e) { 
      e.preventDefault();
      app.addFriend($(this)[0].innerText.substring(1));
    });

    // Handler for submitting messages
    $(document).on('submit', '#postMessage', function(e) {
      e.preventDefault();
      var body = $(this).find('input[name="message"]').val();
      app.addMessage(body);
      app.fetch(function(obj) {
        return obj.roomname === app.currentRoom;
      });
    });

    // Handler for changing room dropdown selection
    $(document).on('change', '#roomList', function() {
      // filter update for loops to only have $(this) roomnames

      app.currentRoom = this.value;
      app.fetch(function(obj) {
        return obj.roomname === app.currentRoom;
      });
    });
  },

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
    $.ajax({
      url: this.server,
      type: 'GET',
      success: function(data) {
        // Update Messages:
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
      // Check if roomname === currentRoom:
      if (predicate && !predicate(data.results[i]) && app.currentRoom !== 'all') { 
        continue; 
      }
      if (!data.results[i].username || !data.results[i].text || !data.results[i].roomname) { 
        continue; 
      }

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
    app.getRooms(data);
  },

    // Add rooms to rooms dropdown
    // Collect all rooms currently in all server messages
    // populate select dropdown with those rooms
  getRooms: function(data) {
    $('#roomList').html('');
    var rooms = [];
    for (var i = 0; i < data.results.length; i++) {
      if (data.results[i].roomname) {
        rooms.push(data.results[i].roomname.replace(/(<([^>]+)>)/ig, ""));
      }
    }
    rooms = _.uniq(rooms, false);
    var option = '<option value="all">all</option>';
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
      app.fetch(function(obj) {
        return obj.roomname === app.currentRoom;
      });
    }
  },
};

app.init();

setInterval(function() {
  app.fetch(function(obj) {
    return obj.roomname === app.currentRoom;
  });  
}, 3000);

