define(["jquery", "api", "config","io", "knockout","mapping","knockout-bindings","io",
       "goog!visualization,1,packages:[corechart]",
       "async!http://maps.google.com/maps/api/js?v=3&key=AIzaSyAdvsNjX55_tVX8mJ57Cj_fGN_3OW8CbC4&sensor=false"],
       function($, api, config, io, ko,komap) {
    
    "use strict";
    
   
    var socket_url  = config.io;
    var http_url    = config.http;
    var socket;

    var map, devices_bounds;
    var devices = [];

    function initMap(){
      
      var myLatlng = new google.maps.LatLng(40.750167, -73.86509);

      var mapOptions = {
        center: myLatlng,
        zoom: 4
      };

      map = new google.maps.Map(document.getElementById('mapdiv'), mapOptions);
     
      devices_bounds = new google.maps.LatLngBounds();
    }

    function getDevice(device_id, markers){
      var device = null;

      for(var i = 0; i < markers.length; i++){
        if(markers[i].device_id === device_id){
          device = markers[i];
          break;
        }
      }

      return device;
    }

    function processGPS(gps){
      var gps = gps[0];
      console.log(gps);
      var device = getDevice(gps.member.device_id, devices);
      //console.log('on message' + gps.member[0].device_id);
      if(device == null){
        device = createDevice(gps);
        devices.push(device);
      }
      else{
        moveDevice(device, gps.location);
      }
    }

    function createDevice(member){
      var pos = getLatLngFromString(member.location);
      console.log(pos);
      var markerImg = member.member.profile_picture ? member.member.profile_picture : "/img/safety.png"
      var marker = new google.maps.Marker({
        position: pos,
        map: map,
        animation: google.maps.Animation.DROP,
        icon: new google.maps.MarkerImage(markerImg,null, null, new google.maps.Point(0, 42)),
        zIndex:102,
        title: member.member.first_name + "," + member.member.last_name + "(" + member.member.device_id +")"
      });
      marker.set("device_id", member.location.device_id);
      marker.setZIndex(100);
      adjustMapBounds(pos);

      return marker;
    }

    function moveDevice(device, gps){
      var pos = getLatLngFromString(gps);
      device.setPosition(pos);
      adjustMapBounds(pos);
    }

    function adjustMapBounds(pos){
      // need to wait for the tiles to load before we can get the map bounds
      var currentBounds = map.getBounds();

      if(typeof(currentBounds) != 'undefined' &&  currentBounds.contains(pos) == false){
        devices_bounds.extend(pos);
        map.fitBounds(devices_bounds);
      }
    }

    function fitAllDevicesOnMap(){
      for(var i = 0; i < devices.length; i++){
        var pos = devices[i].getPosition();
        devices_bounds.extend(pos);
        map.fitBounds(devices_bounds);
      }
    }

    function initDeviceLocations(){
    devices = [];
     api.getLocations ('54bce07721b1994c27bdbabe').done(function( rdata ) {
     var data = rdata.data;
     var l = data.members.length;
     console.log(data.members);
        for(var i = 0; i < l ; i++){
           var d = data.members[i];
           var gps = d.location;
              if(gps.gps_latitude != 0 && gps.gps_longitude != 0){
                var device = createDevice(d);
                devices.push(device);
              }
            
            }
        fitAllDevicesOnMap();
      });
    }

    function getLatLngFromString(obj){
      var lat = parseFloat(obj.gps_latitude), lon = parseFloat(obj.gps_longitude);
      return new google.maps.LatLng(lat, lon);
    }

    function formatGPSHTMLOutput(gps){
      var s = gps.device_id + ' ';
      s += gps.gps_timestamp + ' ';
      s += '(' + gps.gps_latitude + ',' + gps.gps_longitude + ')';
      s += '<br/>';
      return s;
    }

    function initSocket(user_id, data){
      socket = io.connect(socket_url);

       socket.on('connect', function () {
        // Identify this socket with the user_id
        
        socket.emit('set_user', user_id);
         for(var i=0;i < data.length;i++){
            socket.emit('add_device', data[i]);
         }
     });
     
     
      socket.on('message', function(d){
       
        var parsedObj = JSON.parse(d);
        if(parsedObj.type === 'gps'){
          var gps = parsedObj.data;
          $('#messages').append(formatGPSHTMLOutput(gps));
          processGPS(gps);
        }
      });
    }

  
    $(function(){   
      initMap();
     
        api.getDevices().done(function(data){
            var devices = data.data.devices;
            initSocket(api.getUser(),devices);
            initDeviceLocations(devices);
      });
    });
   
    return {
    
    };
      
});