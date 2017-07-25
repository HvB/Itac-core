var ZP, CX, ZINDEX = 1,
    ANGLE_TOP = 180,
    ANGLE_LEFT = 90,
    ANGLE_BOTTOM = 0,
    ANGLE_RIGHT = 270,
    ORIENTATION_TOP = 'top',
    ORIENTATION_LEFT = 'right',
    ORIENTATION_BOTTOM = 'bottom',
    ORIENTATION_RIGHT = 'left';

$.get(location.href + '/config.json', function (data) {
    var url = window.location.hostname + ':' + data.configZP.portWebSocket;
    ZP = data.configZP.idZP;
    
    /* -----------------------------------*/
    /*  creation du menu                */
    /* -----------------------------------*/

    $('.menu').circleMenu({
        circle_radius: 150,
        direction: 'full',
        trigger: 'none',
        open: function () {
            var qrcode = new QRious({value: "itac://" + url});
            $('.menu .qr-code').css('background-image', 'url("' + qrcode.toDataURL() + '")');
        }
    });

    if (jQuery.ui) {
        console.log('PAGE : connexionApp.ejs -> charge JQuery');
    } else {
        console.log('PAGE : connexionApp.ejs -> charge JQuery');
        console.log("PAGE : connexionApp.ejs : pas de chargement jQuery.ui");
    }

    console.log('PAGE : connexionApp.ejs -> on s occupe maintenant de la connexion');

    console.log('******************* PARAMETRE PASSE PAR LA REQUETE  ********************************');
    console.log('PAGE : workspace.ejs -> demande connection socket sur : ' + url);

    CX = new Connection(url, data.event);
});