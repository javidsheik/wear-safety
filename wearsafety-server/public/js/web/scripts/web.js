// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
   
   $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
    
    $('#myCarousel').carousel({
        interval: 2000
    });
    
    $('#myCarousel').on('slid.bs.carousel', function (e) {
        if ($('.carousel-inner .item:last').hasClass('active')) {
            $('#myCarousel').carousel('pause');
        }
        if ($('.carousel-inner .item:first').hasClass('active')) {
            $('#myCarousel').carousel('cycle');
        }
    });
    
    $("#contactForm").submit(function(e)
    {
        var postData = $("#contactForm").serializeArray();
        var formURL = $(this).attr("action");
        $.ajax(
        {
            url : '/api/capture_lead',
            type: "POST",
            data : postData,
            success:function(data, textStatus, jqXHR)
            {
                alert(data.data.message);
            },
            error: function(jqXHR, textStatus, errorThrown)
            {
            console.log(data);
                 alert(data.data.message);     
            }
        });
        
        e.preventDefault();
        
    });
    
   
    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top'
    })

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
        $('.navbar-toggle:visible').click();
    });

 
}); 