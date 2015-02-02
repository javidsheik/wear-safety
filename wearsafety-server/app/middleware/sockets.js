var config = require('../config/config');
var eventsEmitter = require(config.root + '/app/middleware/events');

var map_clients = [];


eventsEmitter.on('location',function(data){

console.log("Connected clients: " + map_clients.length);

    for(var i=0; i < map_clients.length; i++){
        
        var client = map_clients[i];
        
        console.log("client.user_id:" + client.user_id);
        console.log("client.devices:" + client.devices);
        
    if (typeof client.devices != "undefined") {
    
        if(client.devices.indexOf(data.user_id)){
        
        console.log("Sending gps to viewer: " + client.user_id);
        console.log("Devices: " + client.devices);

         var jsonString = JSON.stringify({ type:'gps', data:data});

        client.send(jsonString);
      }
     }
   }

});

module.exports = function (io) {
  
  io.sockets.on("connect", function(client){
    
    console.log("Socket Server Connected....");
     
    map_clients.push(client);

      client.on('set_user',function(user_id){
      
        console.log("Socket client connected for user_id: " + user_id);
        client.user_id = user_id;
        
      });

      client.on('add_device',function(device_id){
      
        console.log("Socket Add device : " + device_id);

        if (typeof client.devices == "undefined") {
          client.devices = [];
        }

        client.devices.push(device_id);
      });


      client.on('disconnect', function(){
        map_clients.splice(map_clients.indexOf(client), 1);
      })

    });
};