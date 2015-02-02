requirejs.config({
    paths: {
        jquery: "../libs/jquery-1.10.0.min",     
        knockout: "//cdnjs.cloudflare.com/ajax/libs/knockout/2.2.1/knockout-min",
        mapping: "//cdnjs.cloudflare.com/ajax/libs/knockout.mapping/2.3.5/knockout.mapping" ,       
        async: "../libs/async",
        goog: "../libs/goog",
        io: "http://localhost:3001/socket.io/socket.io.js",
        propertyParser : "../libs/propertyParser",        
        datatables: '//cdn.datatables.net/1.10-dev/js/jquery.dataTables',
        bootDataTable: "//cdn.datatables.net/plug-ins/a5734b29083/integration/bootstrap/3/dataTables.bootstrap.js",
        responsiveDataTable: "//cdn.datatables.net/responsive/1.0.1/js/dataTables.responsive"
    },
    shim: {
        jquery: {
            exports: "jQuery"
        },
        bootstrap: {
            deps: ["jquery"]
        } ,
        deps: ['knockout', 'mapping'],
        callback: function (ko, mapping) {
            ko.mapping = mapping;
        }
        
    }
});

define("jquery", function() {
    return window.jQuery;
});

define("bootstrap", function() {
    // Doesn't export anything, already on the page.
});



