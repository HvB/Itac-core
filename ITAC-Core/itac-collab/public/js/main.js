var URL, ZP, ZINDEX;
$.get(location.href + '/config.json', function(data) {
    URL = window.location.hostname + ':' + data.configZP.portWebSocket;
    ZP = data.configZP.idZP;

    ZINDEX = 1;

    startConnexion();
});