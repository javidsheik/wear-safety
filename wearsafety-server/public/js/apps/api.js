define(["config"], function(config) {

    "use strict";
   
    function getCookie(cname) {
        var name = cname + "=";
      
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
        }
        return "";
    } 


    function getToken(){
     return getCookie('token');
    }
    
    function getUser(){
     return getCookie('user_id').substring(4);
    }
    
    
    function getLocations(input) {
        return $.ajax("/api/locations/" + encodeURIComponent(input) + "?token=" + getToken());
    }
    
    function getDevices(input) {
        return $.ajax("/api/user/devices/" + encodeURIComponent(getUser()) + "?token=" + getToken());
    }
    
    
    function addFood(food) {     
        food.token = getToken();
        console.log(food);        return $.ajax("/api/foods/create" , {
                    data: JSON.stringify(food),
                    contentType: "application/json",
                    type: "POST"
                });
    }
    
    
        
    return { 
        getLocations: getLocations,
        getUser: getUser,
        getDevices: getDevices      
    };
});