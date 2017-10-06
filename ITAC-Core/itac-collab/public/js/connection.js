/********************************************************************************************************/
/* --------------------------------- Gestion de la connexion ------------------------------------------ */
/********************************************************************************************************/
class Connection {
    /**
     * Crée la connexion
     * @param ZP zone de partage courante
     * @param event liste des évènements de la socket
     */
    constructor(ZP, events) {
        this._ZP = ZP;
        this._events = events;
        this._socket = io(this._ZP.menu.url, {forceNew: true, transports: ['websocket']});
        this._socket.on('connect', (function () {
            this._initialize();
        }).bind(this));
        this._socket.connect();
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
            this._onAddedArtifactInZE(login, idZE, data);
        }).bind(this));

        this._socket.on(this._events.ReceptionArtefactIntoZP, (function (login, idZE, data) {
            this._onAddedArtifactInZP(login, idZE, data);
        }).bind(this));

        this._socket.on(this._events.ArtefactDeletedFromZE, (function (idAr, idZE, idZEP) {
            this._onRemovedArtifactInZE(idAr, idZE, idZEP);
        }).bind(this));

        this._socket.on(this._events.SuppressZEinZP, (function (login, idZE) {
            this._onZEDisconnection(login, idZE);
        }).bind(this));

        this._socket.on(this._events.ReponseOKEnvoie_ArtefactdeZPversZP, (function (idArtifact) {
            this._onArtifactFromZPToOtherZP(idArtifact);
        }).bind(this));

        this._socket.on('disconnect', (function () {
            this._onZADisconnection();
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

        var $element = $('.ZP > .menu');
        $element.find('.send').remove();
        for (var i = 0; i < ZC.nbZP; i++) {
            if (ZC.ZP[i].idZP != this._ZP.id) {
                var otherZP = ZC.ZP[i],
                    idZP = otherZP.idZP;
                console.log('PAGE : workspace.ejs -> menu App , push = ' + idZP + " ZP");
                this._ZP.menu.addOtherZP(idZP, otherZP);
                $('.template > .menu').find('.send').clone().attr('id', idZP).html(idZP).appendTo($element);
            }
        }
        $element.circleMenu({
            circle_radius: 150,
            direction: 'full',
            trigger: 'none',
            open: (function () {
                $element.find('.qr-code').css('background-image', 'url("'
                    + new QRious({value: "itac://" + this._ZP.menu.url}).toDataURL() + '")');
            }).bind(this)
        });
        $('.overlay').hide();

        console.log('Zone collaborative active : ' + ZC.idZC + '\n\nBienvenue sur l\'Espace de Partage :' + this._ZP.id + '\n\n');
        console.log('PAGE : workspace.ejs -> reception evenement [EVT_ReponseOKConnexionZA] pour ZP= ' + this._ZP.id);
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
            $point = $('.template .artifact.point').clone(),
            nbZE = $('.ZP > .ZE').length;
        $('.ZP > .ZE').removeClass('n' + nbZE).addClass('n' + (nbZE + 1));
        $element.addClass('n' + (nbZE + 1)).addClass('ZE' + (nbZE + 1)).attr('id', idZE).appendTo('.ZP');
        $element.find('.login').text(login);
        $element.find('img').attr('id', 'avatar' + posAvatar);
        $element.find('.tool').append($point.addClass('dropped')).hide();

        var matrix = $element.css('transform'),
            angle = 0;
        if (matrix !== 'none') {
            var values = matrix.split('(')[1].split(')')[0].split(',');
            angle = Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI));
        }
        this._ZP.addZE(idZE, angle);
        $point.attr('id', this._ZP.getZE(idZE).tool.point.id);
    }

    /**
     * Crée un artefact
     * @param data données json de l'artefact
     * @private
     */
    _createArtifact(json) {
        this._ZP.addArtifact(json.id, json);
        var artifact = this._ZP.getArtifact(json.id),
            $element = $('.template .artifact.' + artifact.type).clone();
        switch (artifact.type) {
            case ARTIFACT_MESSAGE:
                $element.find('h1').text(artifact.title);
                $element.find('p').first().text(artifact.content);
                break;
            case ARTIFACT_IMAGE:
                $element.css('background-image', 'url(' + artifact.content + ')');
                if (artifact.isBackground) {
                    this._ZP.background = artifact.id;
                    $element.hide();
                    $('.ZP')
                        .css('background-image', $element.css('background-image'))
                        .css('background-position', 'center')
                        .css('background-repeat', 'no-repeat')
                        .css('background-size', 'contain')
                        .addClass('background');
                    for (var id in artifact.points) {
                        var $point = $('.template .artifact.point').clone(),
                            point = artifact.getPoint(id);
                        $('.ZP').append($point);
                        $point.attr('id', id);
                        $point.css('transform', 'translate(' + point.x + 'px, ' + point.y + 'px)');
                    }
                }
        }
        $element.find('.historic .creator').text(artifact.creator);
        $element.find('.historic .dateCreation').text(getFormattedDate(artifact.dateCreation));
        $element.find('.historic .owner').text(artifact.owner);
        var $temp = $element.find('.historic .modification');
        for (var i = 0; i < artifact.history.length; i++) {
            var $clone = $temp.clone();
            $clone.find('.modifier').text(artifact.history[i].user);
            $clone.find('.dateModification').text(getFormattedDate(artifact.history[i].dateModification));
            $element.find('.historic').append($clone);
        }
        $temp.remove();
        $element.attr('id', artifact.id);
        return $element;
    }

    /**
     * Ecoute l'ajout d'un artefact dans la ZP
     * @param login pseudo de l'utilisateur de la ZE
     * @param idZE id de la ZE
     * @param data données json de l'artefact
     * @private
     */
    _onAddedArtifactInZE(login, idZE, data) {
        console.log('PAGE : workspace.ejs -> reception artefact pour ZE= ' + idZE + ' et pseudo=' + login);
        var json = JSON.parse(data);
        this._ZP.getZE(idZE).addArtifact(json.id);
        this._createArtifact(json).addClass('dropped').appendTo($('#' + idZE).find('.container'));
    }

    /**
     * Ecoute l'ajout d'un artefact dans une ZE
     * @param login pseudo de l'utilisateur de la ZE
     * @param idZE id de la ZE
     * @param data données json de l'artefact
     * @private
     */
    _onAddedArtifactInZP(login, idZP, data) {
        console.log('PAGE : workspace.ejs -> reception artefact pour ZP= ' + idZP + ' et pseudo=' + login);
        var json = JSON.parse(data),
            position = json.position ? json.position : {x: 200, y: 200, scale: 1, angle: 0};
        this._createArtifact(json).css('transform', 'translate(' + position.x + 'px, ' + position.y + 'px) scale('
            + position.scale + ') rotate(' + position.angle + 'deg)').appendTo('.ZP');
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
        this._ZP.getZE(idZE).removeArtifact(idArtifact);
        this._ZP.removeArtifact(idArtifact);
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
    _onArtifactFromZPToOtherZP(idArtifact) {
        console.log("menu ITAC -> ZP.ondrop : transfert Artefact envoye et bien recu " + idArtifact);
    }

    /**
     * Ecoute la déconnexion de la ZA
     * @private
     */
    _onZADisconnection() {
        $('.overlay').show();
        $('.overlay').css('z-index', Z_INDEX);
        Z_INDEX++;
    }

    /**
     * Emet la connexion à la ZA
     * @private
     */
    _emitConnection() {
        this._socket.emit(this._events.DemandeConnexionZA);
        console.log('PAGE : workspace.ejs -> emission evenement EVT_DemandeConnexionZA pour ZP= ' + this._ZP.id);
    }

    /**
     * Emet l'envoi d'un artefact d'une ZE vers la ZP
     * @param idArtifact id de l'artefact
     * @param idZE id de la ZE
     * @public
     */
    emitArtifactFromZEToZP(idArtifact, idZE) {
        console.log('ondragleave d un Artefact (' + idArtifact + ') de la ZE= ' + idZE + ' vers la ZP= ' + this._ZP.id);
        this._socket.emit(this._events.EnvoieArtefactdeZEversZP, idArtifact, idZE, this._ZP.id);
    }

    /**
     * Emet l'envoi d'un artefact de la ZP vers une ZE
     * @param idArtifact id de l'artefact
     * @param idZE id de la ZE
     * @public
     */
    emitArtifactFromZPToZE(idArtifact, idZE) {
        console.log('ondrop d un Artefact (' + idArtifact + ') de la ZP= ' + this._ZP.id + ' vers la ZE= ' + idZE);
        this._socket.emit(this._events.EnvoieArtefactdeZPversZE, idArtifact, idZE);
    }

    /**
     * Emet l'envoi d'un artefact vers une autre ZP
     * @param idArtifact id de l'artefact
     * @param idOtherZP id de l'autre ZP
     * @public
     */
    emitArtifactFromZPToOtherZP(idArtifact, idOtherZP) {
        console.log("menu ITAC -> transfert ART = " + idArtifact + " de ZP=" + this._ZP.id + " vers ZP=" + idOtherZP);
        this._socket.emit(this._events.EnvoieArtefactdeZPversZP, idArtifact, this._ZP.id, idOtherZP);
    }

    /**
     * Emet la suppression d'un artefact dans la ZP
     * @param idArtifact id de l'artefact
     * @public
     */
    emitRemovedArtifactInZP(idArtifact) {
        console.log("menu ITAC -> suppresion ART = " + idArtifact);
        this._socket.emit(this._events.ArtefactDeletedFromZP, idArtifact);
    }

    /**
     * Emet la mise à jour complète d'un artefact
     * @param idArtifact id de l'artefact
     * @param artifact nouvel artefact
     * @public
     */
    emitArtifactFullUpdate(idArtifact, artifact) {
        console.log("PAGE : workspace.ejs -> mise à jour complète ART = " + idArtifact);
        this._socket.emit(this._events.ArtifactFullUpdate, idArtifact, artifact);
    }

    /**
     * Emet la mise à jour partielle d'un artefact
     * @param idArtifact id de l'artefact
     * @param patch patch json pour la mise à jour de l'artefact
     * @public
     */
    emitArtifactPartialUpdate(idArtifact, patch) {
        console.log("PAGE : workspace.ejs -> mise à jour partielle ART = " + idArtifact);
        this._socket.emit(this._events.ArtifactPartialUpdate, idArtifact, patch);
    }

    /**
     * Emet la mise à jour partielle d'une liste d'artefacts
     * @param list liste de couple id / patch pour la mise à jour de l'artefact
     * @public
     */
    emitArtifactsPartialUpdate(list) {
        console.log("PAGE : workspace.ejs -> mise à jour partielle d'une liste ART");
        this._socket.emit(this._events.ArtifactsPartialUpdates, list);
    }
}