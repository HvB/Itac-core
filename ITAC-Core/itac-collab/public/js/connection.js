/********************************************************************************************************/
/* --------------------------------- Gestion de la connexion ------------------------------------------ */
/********************************************************************************************************/
class Connection {
    /**
     * Crée la connexion
     * @param url lien pour établir la connexion
     * @param event liste des évènements de la socket
     */
    constructor(url, events) {
        this._socket = io.connect(url);
        this._events = events;
        this._socket.on('connect', (function () {
            this._initialize()
        }).bind(this));
    }

    /**
     * Initialise la connexion avec le serveur
     * @private
     */
    _initialize() {
        console.log('PAGE ZA : workspace.ejs -> **** connexion socket ZA vers Serveur [OK] : idSocket =' + this._socket.id);
        console.log('****************************************************************************');

        this._socket.on(this._events.ReponseOKConnexionZA, (function (ZC) {
            this._onZAConnectionOK(ZC);
        }).bind(this));

        this._socket.on(this._events.ReponseNOKConnexionZA, (function () {
            this._onZAConnectionKO();
        }).bind(this));

        this._socket.on(this._events.NewZEinZP, (function (login, idZE, idZP, posAvatar) {
            this._onZEConnection(login, idZE, idZP, posAvatar);
        }).bind(this));

        this._socket.on(this._events.ReceptionArtefactIntoZE, (function (login, idZE, data) {
            this._onAddedArtifactInZP(login, idZE, data);
        }).bind(this));

        this._socket.on(this._events.ReceptionArtefactIntoZP, (function (login, idZE, data) {
            this._onAddedArtifactInZE(login, idZE, data);
        }).bind(this));

        this._socket.on(this._events.ArtefactDeletedFromZE, (function (idAr, idZE, idZEP) {
            this._onRemovedArtifactInZE(idAr, idZE, idZEP);
        }).bind(this));

        this._socket.on(this._events.SuppressZEinZP, (function (login, idZE) {
            this._onZEDisconnection(login, idZE);
        }).bind(this));

        this._socket.on(this._events.ReponseOKEnvoie_ArtefactdeZPversZP, (function (idArtifact) {
            this._onArtifactFromZPtoOtherZP(idArtifact);
        }).bind(this));

        this._socket.on('disconnect', (function () {
            this._onDisconnection();
        }).bind(this));

        this._emitConnection();
    }

    /**
     * Ecoute une connexion réussi à la ZA
     * @param ZC entité globale qui contient toutes les ZP
     * @private
     */
    _onZAConnectionOK(ZC) {
        console.log('PAGE : workspace.ejs -> ZC =' + JSON.stringify(ZC));
        console.log('PAGE : workspace.ejs -> ajout des ZP , total =' + ZC.nbZP);

        for (var i = 0; i < ZC.nbZP; i++) {
            if (ZC.ZP[i].idZP != ZP) {
                console.log('PAGE : workspace.ejs -> menu App , push = ' + ZC.ZP[i].idZP + " ZP");
                $('.menu').append('<li class="send" data-ZP="' + ZC.ZP[i].idZP + '">' + ZC.ZP[i].idZP + '</li>');
            }
        }
        $('.menu').circleMenu('init');
        $('.overlay').hide();

        console.log('Zone collaborative active : ' + ZC.idZC + '\n\nBienvenue sur l\'Espace de Partage :' + ZP + '\n\n');
        console.log('PAGE : workspace.ejs -> reception evenement [EVT_ReponseOKConnexionZA] pour ZP= ' + ZP);
    }

    /**
     * Ecoute une connexion échouée à la ZA
     * @private
     */
    _onZAConnectionKO() {
        console.log('PAGE : workspace.js -> reception evenement [EVT_ReponseNOKConnexionZA]');
    }

    /**
     * Ecoute la connexion d'une ZE
     * @param login pseudo de l'utilisateur de la ZE
     * @param idZE id de la ZE
     * @param idZEP id de la ZEP associée
     * @param posAvatar avatar de l'utilisateur de la ZE
     * @private
     */
    _onZEConnection(login, idZE, idZEP, posAvatar) {
        console.log('PAGE : workspace.ejs -> Creation d une ZE =' + idZE + ' \n ZEP associee = ' + idZEP + '\n pour pseudo=' + login);
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
    }

    /**
     * Ecoute l'ajoute d'un artefact dans la ZP
     * @param login pseudo de l'utilisateur de la ZE
     * @param idZE id de la ZE
     * @param data données json de l'artefact
     * @private
     */
    _onAddedArtifactInZP(login, idZE, data) {
        console.log('PAGE : workspace.ejs -> reception artefact pour ZE= ' + idZE + ' et pseudo=' + login);
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
    }

    /**
     * Ecoute l'ajout d'un artefact dans une ZE
     * @param login pseudo de l'utilisateur de la ZE
     * @param idZE id de la ZE
     * @param data données json de l'artefact
     * @private
     */
    _onAddedArtifactInZE(login, idZP, data) {
        console.log('PAGE : workspace.ejs -> reception artefact pour ZP= ' + idZP + ' et pseudo=' + login);
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
    }

    /**
     * Ecoute la suppression d'un artefact dans une ZE
     * @param idArtifact id de l'artefact
     * @param idZE id de la ZE
     * @param idZEP id de la ZEP associée
     * @private
     */
    _onRemovedArtifactInZE(idArtifact, idZE, idZEP) {
        console.log('PAGE : workspace.js -> supression artefact pour IdArt = ' + idArtifact + ' idZE=' + idZE + 'idZEP=' + idZEP);
        $('#' + idZE).find('#' + idArtifact).remove();
    }

    /**
     * Ecoute la déconnexion d'une ZE
     * @param login pseudo de l'utilisateur de la ZE
     * @param idZE id de la ZE
     * @private
     */
    _onZEDisconnection(login, idZE) {
        console.log('PAGE : workspace.ejs -> Suprresion d une ZE =' + idZE + ' \n pour pseudo=' + login);
        $('#' + idZE).remove();
    }

    /**
     * Ecoute l'envoi d'un artefact vers une autre ZP
     * @param idArtifact id de l'artefact
     * @private
     */
    _onArtifactFromZPtoOtherZP(idArtifact) {
        console.log("menu ITAC -> ZP.ondrop : transfert Artefact envoye et bien recu " + idArtifact);
    }

    /**
     * Ecoute la déconnexion de la ZA
     * @private
     */
    _onDisconnection() {
        $('.overlay').show();
        $('.overlay').css('z-index', ZINDEX);
        ZINDEX++;
    }

    /**
     * Emet la connexion à la ZA
     * @private
     */
    _emitConnection() {
        this._socket.emit(this._events.DemandeConnexionZA);
        console.log('PAGE : workspace.ejs -> emission evenement EVT_DemandeConnexionZA pour ZP= ' + ZP);
    }

    /**
     * Emet l'envoi d'un artefact d'une ZE vers la ZP
     * @param idArtifact id de l'artefact
     * @param idZE id de la ZE
     * @public
     */
    emitArtifactFromZEtoZP(idArtifact, idZE) {
        console.log('ondragleave d un Artefact (' + idArtifact + ') de la ZE= ' + idZE + ' vers la ZP= ' + ZP);
        this._socket.emit(this._events.EnvoieArtefactdeZEversZP, idArtifact, idZE, ZP);
    }

    /**
     * Emet l'envoi d'un artefact de la ZP vers une ZE
     * @param idArtifact id de l'artefact
     * @param idZE id de la ZE
     * @public
     */
    emitArtifactFromZPtoZE(idArtifact, idZE) {
        console.log('ondrop d un Artefact (' + idArtifact + ') de la ZP= ' + ZP + ' vers la ZE= ' + idZE);
        this._socket.emit(this._events.EnvoieArtefactdeZPversZE, idArtifact, idZE);
    }

    /**
     * Emet l'envoi d'un artefact vers une autre ZP
     * @param idArtifact id de l'artefact
     * @param idOtherZP id de l'autre ZP
     */
    emitArtifactFromZPtoOtherZP(idArtifact, idOtherZP) {
        console.log("menu ITAC -> transfert ART = " + idArtifact + " de ZP=" + ZP + " vers ZP=" + idOtherZP);
        this._socket.emit(this._events.EnvoieArtefactdeZPversZP, idArtifact, ZP, idOtherZP);
    }

    /**
     * Emet la suppression d'un artefact dans la ZP
     * @param idArtifact id de l'artefact
     */
    emitRemovedArtifactInZP(idArtifact) {
        console.log("menu ITAC -> suppresion ART = " + idArtifact);
        this._socket.emit(this._events.ArtefactDeletedFromZP, idArtifact);
    }
}