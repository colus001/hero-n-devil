$('#socketTest').on('click', function () {
  console.log('clicked');

  var socket = io.connect('http://localhost:3000');
  socket.emit('attack', { hi: 'hi, hello'});
});