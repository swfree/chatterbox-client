// YOUR CODE HERE:
var app = {
  server: 'https://api.parse.com/1/classes/messages',

  init: function() {
    // Initialize friends & call fetch once to fill page
    this.friends = {};
    this.currentRoom = 'all';
    this.fetch(function(obj) {
      return obj.roomname === app.currentRoom;
    });

    // Click handler for adding usernames to friends list
    $(document).on('click', '.username', function(e) { 
      e.preventDefault();
      app.addFriend($(this).attr('name'));
    });

    // Handler for submitting messages
    $(document).on('submit', '#postMessage', function(e) {
      e.preventDefault();
      var body = $(this).find('input[name="message"]').val();
      var newRoom = $(this).find('input[name="newRoom"]').val();
      newRoom.length > 0 ? app.addMessage(body, newRoom) : app.addMessage(body);
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

  queryRooms: function(room) {
    $.ajax({
      url: app.server,
      type: 'GET',
      dataType: 'JSON',
      data: {
        limit: 30,
        where: {"roomname": room}
      },
      success: function(data) {
        console.log(data);
      },
      error: function(data) {
        console.error('chatterbox: Failed to get filter rooms', data);
      },
    });
  },

  send: function(message) {
    $.ajax({
      url: this.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function(data) {
        // console.log('sent', data);
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
      data: {
        limit: 30
      },
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
    for (var i = 0; i < data.results.length; i++) {
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
        $('#chats').append(app.formatMessage(cleanUsers[i], cleanTexts[i], true));
      } else {
        $('#chats').append(app.formatMessage(cleanUsers[i], cleanTexts[i], false));
      }
    }
    app.getRooms(data);
  },

  formatMessage: function(user, message, isFriend){
    var html = '<div class="row">';
    html += '<div class="col s12">';
    html += '<div class="card indigo darken-3">';
    html += '<div class="card-content white-text">';
    if (isFriend) {
      html += '<span class="card-title username"><i class="material-icons">grade</i>' + user + '</span>';
    } else {
      html += '<span class="card-title username">' + user + '</span>';
    }

    html += '<p>' + message + '</p>';
    html += '</div>';
    html += '<div class="card-action">';
    // <a class="btn-floating btn-large waves-effect waves-light red"><i class="material-icons">add</i></a>
    html += '<a class="btn-floating btn-medium waves-effect waves-light red username" name="' + user + '" href="#"><i class="material-icons">add</i></a>';
    html += '<p> ADD FRIEND</p>';
    html += '</div></div></div></div>';
    return html;
  },

    // Add rooms to rooms dropdown
    // Collect all rooms currently in all server messages
    // populate select dropdown with those rooms
  getRooms: function(data) {
    $('select').material_select();
    $('#roomList').html('');
    var rooms = [];
    for (var i = 0; i < data.results.length; i++) {
      if (data.results[i].roomname) {
        rooms.push(data.results[i].roomname.replace(/(<([^>]+)>)/ig, ""));
      }
    }
    rooms = _.uniq(rooms, false);
    if (app.currentRoom === 'all') { 
      var option = '<option value="all">all</option>'; 
    } else {
      var option = '<option value="' + app.currentRoom + '">' + app.currentRoom + '</option><option value="all">all</option>';
    }
    for (var i = 0; i < rooms.length; i++) {
      if (rooms[i] === app.currentRoom) { continue; }
      option += '<option value="' + rooms[i] + '">' + rooms[i] + '</option>';
    }
    $('#roomList').append(option);
  },
 
  clearMessages: function() {
    $('#chats').empty();
  },

  addMessage: function(message, newRoom) {
    var currentUsername = window.location.search.substring(10); 
    var roomName = newRoom || $('#roomList')[0].value;
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
      app.fetch(function(obj) {
        return obj.roomname === app.currentRoom;
      });
    }
  },
};

app.init();
app.queryRooms();

setInterval(function() {
  app.fetch(function(obj) {
    return obj.roomname === app.currentRoom;
  });  
}, 3000);

