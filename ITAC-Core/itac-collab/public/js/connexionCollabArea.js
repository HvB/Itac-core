/********************************************************************************************************/
/* --------------------------------- Gestion de la connexion ------------------------------------------ */
/********************************************************************************************************/

if (jQuery.ui) {
    console.log('PAGE : connexionApp.ejs -> charge JQuery');
} else {
    console.log('PAGE : connexionApp.ejs -> charge JQuery');
    console.log("PAGE : connexionApp.ejs : pas de chargement jQuery.ui");
}

console.log('PAGE : connexionApp.ejs -> on s occupe maintenant de la connexion');

console.log('******************* PARAMETRE PASSE PAR LA REQUETE  ********************************');
console.log('PAGE ZA : workspace.ejs -> urldemande = ' + urldemande);
console.log('PAGE ZA : workspace.ejs -> zpdemande = ' + zpdemande);
console.log('PAGE ZA : workspace.ejs -> rang = ' + rang);
console.log('PAGE ZA : workspace.ejs -> ZEmax = ' + ZEmax);
console.log('****************************************************************************');
console.log('');
console.log('PAGE : workspace.ejs -> demande connection socket sur : ' + urldemande);

var addZero = function (value) {
    return value > 9 ? value : '0' + value;
}
var getFormattedDate = function (d) {
    var date = new Date(d);
    return addZero(date.getUTCDate()) + '/' + addZero(date.getUTCMonth() + 1) + '/' + date.getUTCFullYear()
        + ' - ' + addZero(date.getUTCHours()) + ':' + addZero(date.getUTCMinutes());
};

/* -----------------------------------*/
/*  creation du menu                */
/* -----------------------------------*/

$('.menu').circleMenu({
    circle_radius: 150,
    direction: 'full',
    trigger: 'none',
    open: function () {
        var url = urldemande.split(/\/\/|:/),
            qrcode = new QRious({value: JSON.stringify({ip: url[2], port: url[3]})});
        $('.menu .qr-code').css('background-image', 'url("' + qrcode.toDataURL() + '")');
    }
});

/* -----------------------------------*/
/*  connexion socket                  */
/* -----------------------------------*/

var socket = io.connect(urldemande);
socket.on('connect', function () {

    console.log('PAGE ZA : workspace.ejs -> **** connexion socket ZA vers Serveur [OK] : idSocket =' + socket.id);
    console.log('****************************************************************************');

    /* ------------------------------------------------------*/
    /* --- premiere connexion ZA (Zone d'affichage = App) ---*/
    /* ------------------------------------------------------*/

    socket.emit('EVT_DemandeConnexionZA', urldemande, zpdemande);
    console.log('PAGE : workspace.ejs -> emission evenement EVT_DemandeConnexionZA pour ZP= ' + zpdemande);

    socket.on('EVT_ReponseOKConnexionZA', function (ZC) {
        console.log('PAGE : workspace.ejs -> ZC =' + JSON.stringify(ZC));
        // console.log('PAGE : workspace.ejs -> menu App initial : ' + menu);
        console.log('PAGE : workspace.ejs -> ajout des ZP , total =' + ZC.nbZP);

        for (var i = 0; i < ZC.nbZP; i++) {
            if (i != rang) {
                console.log('PAGE : workspace.ejs -> menu App , push = ' + ZC.ZP[i].idZP + " ZP");
                $('.menu').append('<li class="send" data-ZP="' + ZC.ZP[i].idZP + '">' + ZC.ZP[i].idZP + '</li>');
            }
        }
        $('.menu').circleMenu('init');
        $('.overlay').hide();

        console.log('Zone collaborative active : ' + ZC.idZC + '\n\nBienvenue sur l\'Espace de Partage :' + ZC.ZP[rang].idZP + '\n\n');
        console.log('PAGE : workspace.ejs -> reception evenement [EVT_ReponseOKConnexionZA] pour ZP= ' + ZC.ZP[rang].idZP);
        console.log('PAGE : workspace.ejs -> parametre de ZP = ' + JSON.stringify(ZC.ZP[rang]));
    });

// callback réponse NOK
    socket.on('EVT_ReponseNOKConnexionZA', function () {
        console.log('PAGE : workspace.js -> reception evenement [EVT_ReponseNOKConnexionZA]');
    });

// ---------------------------------------- Fin des EVT ZA ---------------------------------------------------------


    /* ----------------------------- */
    /* ----- connexion d'une ZE ----*/
    /* ----------------------------- */
    /* --- cas où une tablette a été autorisée à se connecter à l'espace de travail --*/
    socket.on('EVT_NewZEinZP', function (login, idZE, idZP, posAvatar) {
        console.log('PAGE : workspace.ejs -> Creation d une ZE =' + idZE + ' \n ZEP associee = ' + idZP + '\n pour pseudo=' + login);
        var $element = $('.template .ZE').clone(),
            nbZE = $('.ZP > .ZE').length;
        $('.ZP > .ZE').removeClass('n' + nbZE).addClass('n' + (nbZE + 1));
        $element.addClass('n' + (nbZE + 1)).addClass('ZE' + (nbZE + 1)).attr('id', idZE).appendTo('.ZP');
        $element.find('.login').text(login);
        $element.find('img').attr('id', 'avatar' + posAvatar);

        var matrix = $element.css('transform'),
            angle = 0,
            orientation = 'bottom';
        if (matrix !== 'none') {
            var values = matrix.split('(')[1].split(')')[0].split(',');
            angle = Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI));
        }
        switch (angle) {
            case 90:
                orientation = 'left';
                break;
            case 180:
                orientation = 'top';
                break;
            case 270:
                orientation = 'right';
        }
        $element.attr('data-orientation', orientation);
    });


    /* ------------------------------------------- */
    /* ----- arrivée d'un artefact dans une ZE ----*/
    /* ------------------------------------------- */
    socket.on('EVT_ReceptionArtefactIntoZE', function (login, idZE, data) {
        console.log('PAGE : workspace.ejs -> reception evenement [EVT_ReceptionArtefactIntoZE] pour ZE= ' + idZE);
        var artifact = JSON.parse(data),
            $element = $('.template .artifact.' + artifact.type).clone();
        switch (artifact.type) {
            case 'message':
                $element.find('h1').text(artifact.title);
                $element.find('p').first().text(artifact.content);
                break;
            case 'image':
                $element.css('background-image', 'url(data:image/png;base64,' + artifact.content + ')');
        }
        $element.find('.historic .creator').text(artifact.creator);
        $element.find('.historic .dateCreation').text(getFormattedDate(artifact.dateCreation));
        $element.find('.historic .owner').text(artifact.owner);
        var $temp = $element.find('.historic .modification');
        for (var i = 0; i < artifact.history.length; i++) {
            var $clone = $temp().clone();
            $clone.find('.modifier').text(artifact.history[i].modifier);
            $clone.find('.dateModification').text(getFormattedDate(artifact.history[i].dateModification));
            $element.find('.history').append($clone);
        }
        $temp.remove();
        $element.attr('id', artifact.id);
        $element.attr('data-ZE', artifact.lastZE);
        $element.addClass('dropped');
        $element.appendTo($('#' + idZE).find('.container'));
    });

    /* ------------------------------------------------- */
    /* ----- arrivée d'un artefact directement en ZP ----*/
    /* ------------------------------------------------- */
    socket.on('EVT_ReceptionArtefactIntoZP', function (pseudo, idZP, data) {
        console.log('PAGE : workspace.ejs -> reception evenement [EVT_ReceptionArtefactIntoZP] pour ZP= ' + idZP);
        var artifact = JSON.parse(data),
            $element = $('.template .artifact.' + artifact.type).clone();
        switch (artifact.type) {
            case 'message':
                $element.find('h1').text(artifact.title);
                $element.find('p').first().text(artifact.content);
                break;
            case 'image':
                $element.css('background-image', 'url(data:image/png;base64,' + artifact.content + ')');
        }
        $element.find('.historic .creator').text(artifact.creator);
        $element.find('.historic .dateCreation').text(getFormattedDate(artifact.dateCreation));
        $element.find('.historic .owner').text(artifact.owner);
        var $temp = $element.find('.historic .modification');
        for (var i = 0; i < artifact.history.length; i++) {
            var $clone = $temp().clone();
            $clone.find('.modifier').text(artifact.history[i].modifier);
            $clone.find('.dateModification').text(getFormattedDate(artifact.history[i].dateModification));
            $element.find('.history').append($clone);
        }
        $temp.remove();
        $element.attr('id', artifact.id);
        $element.attr('data-ZE', artifact.lastZE);
        $element.appendTo('.ZP');
    });

    /* ------------------------------------------------ */
    /* ----- Suppression d'un artefact d'une ZE ----*/
    /* ------------------------------------------------ */
    socket.on('EVT_ArtefactDeletedFromZE', function (idAr, idZE, idZEP) {
        console.log('PAGE : workspace.js -> reception evenement [EVT_ArtefactDeletedFromZE] pour IdArt = ' + idAr + ' idZE=' + idZE + 'idZEP=' + idZEP);
        $('#' + idZE).find('#' + idAr).remove();
    })


    /* ------------------------------ */
    /* ----- Deconnexion d'une ZE ----*/
    /* ------------------------------ */
// c'est en fait EVT_SuppressZEinZP
    socket.on('EVT_Deconnexion', function (login, idZE) {
        var $element = $('#' + idZE);
        $element.find('.container .artefact').each(function (index, element) {
            var $element = $(element);
            $element.removeClass('dropped-image dropped-msg left right top');
            $element.find('p').show();
            $element.remove().appendTo('.ZP');
            var x = ($('.ZP').width() - $element.width()) / 2,
                y = ($('.ZP').height() - $element.height()) / 2;
            $element.attr('data-x', x).attr('data-y', y).css('transform', 'translate(' + x + 'px, ' + y + 'px)');
        });
        $element.remove();
    });

    /* ------------------------------------------------ */
    /* ----- Acquittement de l'envoi d'un artefact vers une autre ZP ----*/
    /* ------------------------------------------------ */
    socket.on('EVT_ReponseOKEnvoie_ArtefactdeZPversZP', function (idart) {
        console.log("menu ITAC -> ZP.ondrop : transfert Artefact envoye et bien recu " + idart);
    });

    /* ------------------------------ */
    /* ----- Deconnexion d'une ZA ----*/
    /* ------------------------------ */
    socket.on('disconnect', function () {
        $('.overlay').show();
        $('.overlay').css('z-index', ZINDEX);
        ZINDEX++;
    });
});