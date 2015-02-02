    var socket_host = "localhost";
    var socket_port = 3001;
    var socket_url  = 'http://' + socket_host + ':' + socket_port;
    var http_url = 'http://' + socket_host;
    var socket;

    var map, devices_bounds;
    var devices = [];

    function initMap(){
      
      var myLatlng = new google.maps.LatLng(0,0);

      var mapOptions = {
        center: myLatlng,
        zoom: 10
      };

      map = new google.maps.Map(document.getElementById('map'), mapOptions);
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
      var device = getDevice(gps.device_id, devices);
      if(device == null){
        device = createDevice(gps);
        devices.push(device);
      }
      else{
        moveDevice(device, gps);
      }
    }

    function createDevice(gps){
      var pos = getLatLngFromString(gps);
      var marker = new google.maps.Marker({
        position: pos,
        map: map
      });

      marker.set("device_id", gps.device_id);
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

    function fetchLastknownDeviceLocations(){
      $.get(http_url + '/devices', function( data ) {
        for(var i=0;i < data.length;i++){
          var gps = data[i];
          if(gps.gps_latitude != 0 && gps.gps_longitude != 0){
            device = createDevice(data[i]);
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

    function initSocket(){
      socket = io.connect(socket_url);

      socket.on('message', function(d){
        var parsedObj = JSON.parse(d);
        if(parsedObj.type === 'gps'){
          var gps = parsedObj.data;
          $('#messages').append(formatGPSHTMLOutput(gps));
          processGPS(gps);
        }
      });
    }

    $(document).ready(function(){
      initMap();
      initSocket();
      fetchLastknownDeviceLocations();
    });