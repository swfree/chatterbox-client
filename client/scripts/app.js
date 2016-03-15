// YOUR CODE HERE:
var app = {
  init: function() {
    this.friends = ['me'];
    this.fetch();
    console.log('hi');
    $(document).on('click', '.username', function() { 
      app.addFriend();
      console.log('iugahwfiughawfiugasfiug');
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
    // debugger;
    console.log('grteat');
    $.ajax({
      url: this.server,
      type: 'GET',
      success: function(data) {
        // TODO: STAHP THE TROLLS
        // debugger;
        for (var i = 0; i < data.results.length; i++) {
          if (!data.results[i].username || !data.results[i].text) {
            continue;
          }
          var cleanUser = data.results[i].username.replace(/(<([^>]+)>)/ig, ""); //data.results[i].username
          var cleanText = data.results[i].text.replace(/(<([^>]+)>)/ig, ""); //data.results[i].text
          $('#chats').append(

            '<div class="chat">' + 
            '<div class="username">' + cleanUser + '</div>' + 
            '<p>' + cleanText + '</p></div>');
        } //onclick="app.addFriend()" //<a href="#" class="username">@' + cleanUser + '</a>'
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
    console.log(window.location.search.substring(10)); // TODO: FIX HACKINESS
    // this.send(message);
    // $('#chats').append('<div class="chat">' + message.text + '</div>');
  },

  addRoom: function(roomName) {
    $('#roomSelect').append('<p>' + roomName + '</p>');
  },

  addFriend: function() {

    // debugger;
    //this.friends.push();
    console.log('farts');
  },

  handleSubmit: function() {}
};

app.init();

app.fetch();
setInterval(function() {
  app.fetch();  
}, 1000);

app.addMessage();

// // app.init();
// // console.log(app.friends);








































