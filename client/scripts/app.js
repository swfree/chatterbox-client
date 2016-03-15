// YOUR CODE HERE:
var app = {
  init: function() {
    this.friends = ['me'];
    this.fetch();
    console.log('hi');
    $(document).on('click', '.username', function() { 
      app.addFriend();
      console.log($(this)[0].innerText.substring(1));
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
    $.ajax({
      url: this.server,
      type: 'GET',
      success: function(data) {
        for (var i = 0; i < data.results.length; i++) {
          if (!data.results[i].username || !data.results[i].text) {
            continue;
          }
          var cleanUser = data.results[i].username.replace(/(<([^>]+)>)/ig, ""); 
          var cleanText = data.results[i].text.replace(/(<([^>]+)>)/ig, ""); 
          $('#chats').append(

            '<div class="chat">' + 
            '<a href="#" class="username">@' + cleanUser + '</a>' + 
            '<p>' + cleanText + '</p></div>');
        } 
      },
      error: function(data) {
        console.error('chatterbox: Failed to fetch messages', data);
      }
    });
  },
 
  clearMessages: function() {
    $('#chats').html('');
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

  addFriend: function() {
    //
    app.friends.push();
  },

  handleSubmit: function() {}
};

app.init();

app.fetch();
setInterval(function() {
  app.fetch();  
}, 1000);







































