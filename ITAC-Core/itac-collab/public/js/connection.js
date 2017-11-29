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
        this._artifactObserver = new ArtifactObserver(ZP, this);
        this._pointObserver = new PointObserver(ZP, this);
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
    _createArtifact(json, container = "ZP") {
        this._ZP.addArtifactFromJson(json.id, json);
        let artifact = this._ZP.getArtifact(json.id);
        if (container == "ZP"){
            artifact.newInZP();
        } else {
            artifact.newInZE();
        }
        // let $element = $('.template .artifact.' + artifact.type).clone();
        artifact.addObserver(this._artifactObserver);
        if (artifact.points){
            for (var id in artifact.points){
                //this._ZP.addArtifact(id, artifact.getPoint(id));
                artifact.getPoint(id).addObserver(this._pointObserver);
            }
        }
        // TODO: remove obsolete code
        // switch (artifact.type) {
        //     case ARTIFACT_MESSAGE:
        //         $element.find('h1').text(artifact.title);
        //         $element.find('p').first().text(artifact.content);
        //         break;
        //     case ARTIFACT_IMAGE:
        //         $element.css('background-image', 'url(' + artifact.content + ')');
        //         if (artifact.isBackground) {
        //             this._ZP.background = artifact.id;
        //             $element.hide();
        //             $('.ZP')
        //                 .css('background-image', $element.css('background-image'))
        //                 .css('background-position', 'center')
        //                 .css('background-repeat', 'no-repeat')
        //                 .css('background-size', 'contain')
        //                 .addClass('background');
        //             for (var id in artifact.points) {
        //                 var $point = $('.template .artifact.point').clone(),
        //                     point = artifact.getPoint(id);
        //                 $('.ZP').append($point);
        //                 $point.attr('id', id);
        //                 $point.css('transform', 'translate(' + point.x + 'px, ' + point.y + 'px)');
        //             }
        //         }
        // }
        // $element.find('.historic .creator').text(artifact.creator);
        // $element.find('.historic .dateCreation').text(getFormattedDate(artifact.dateCreation));
        // $element.find('.historic .owner').text(artifact.owner);
        // var $temp = $element.find('.historic .modification');
        // for (var i = 0; i < artifact.history.length; i++) {
        //     var $clone = $temp.clone();
        //     $clone.find('.modifier').text(artifact.history[i].user);
        //     $clone.find('.dateModification').text(getFormattedDate(artifact.history[i].dateModification));
        //     $element.find('.historic').append($clone);
        // }
        // $temp.remove();
        // $element.attr('id', artifact.id);
        return artifact;
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
        console.log(json);
        this._ZP.getZE(idZE).addArtifact(json.id);
        this._createArtifact(json, "ZE");
        //this._createArtifact(json).addClass('dropped').appendTo($('#' + idZE).find('.container'));
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
        var json = JSON.parse(data);
        console.log(json);
        this._createArtifact(json, "ZP");
        //json.position = getRandomPositionInZP(json.position);
        //this._createArtifact(json).css('transform', 'translate(' + json.position.x + 'px, ' + json.position.y
        //     + 'px) scale(' + json.position.scale + ') rotate(' + json.position.angle + 'deg)').appendTo('.ZP');
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


class ArtifactObserver {
    constructor(ZP, connection){
        this._ZP = ZP;
        this._connection = connection;
        console.log("new ArtifactObserver");
        console.log(this._ZP);
        console.log(this._connection);
    }
    update (source, something) {
        console.log("ArtifactObserver update "+something+ ' id '+source.id);
        console.log(this._ZP);
        console.log(this._connection);
        let artifact = source;
        if (something == "deleted") {
            let idArtifact = artifact.id;
            this._ZP.removeArtifact(idArtifact);
            console.log("deleted "+idArtifact+" "+artifact.type+" - "+ARTIFACT_POINT);
            if (artifact.type !==  ARTIFACT_POINT) {
                this._connection.emitRemovedArtifactInZP(idArtifact);
            } else {
                if (artifact.parent) {
                    this._connection.emitArtifactPartialUpdate(artifact.parent.id, [{
                        op: 'remove',
                        path: '/points/' + idArtifact
                    }]);
                }
                // this._ZP.getArtifact(this._ZP.background).removePoint(idArtifact);
                artifact.parent.removePoint(idArtifact);

            }
            $('line[data-from=' + idArtifact + ']').each(function (index, element) {
                let $link = $(element);
                let artifactTo = this._ZP.getArtifact($link.attr('data-to'));
                if (artifactTo && artifact.removeLinkFrom instanceof Function) {
                    artifactTo.removeLinkFrom(artifact);
                }
                $link.remove();
            }.bind(this));
            $('line[data-to=' + idArtifact + ']').each(function (index, element) {
                console.log("ArtifactObserver line"+something+ ' id '+idArtifact);
                console.log(this._ZP);
                console.log(this._connection);
                let $link = $(element);
                let artifactFrom = this._ZP.getArtifact($link.attr('data-from'));
                if (artifactFrom && artifact.removeLinkTo instanceof Function) {
                    artifactFrom.removeLinkTo(artifact);
                }
                $link.remove();
            }.bind(this));
            $('#'+idArtifact).remove();
        } else if (something == "migrated"  || something == "hidden") {
            let idArtifact = artifact.id;
            console.log("ArtifactObserver");
            console.log(this._ZP);
            console.log(this._connection);
            this._ZP.removeArtifact(idArtifact);
            if (artifact.linksTo) {
                for (let idTo in artifact.linksFrom){
                    $('line[data-from=' + idArtifact + '][data-to=' + idTo + ']').remove();
                }
            }
            if (artifact.linksFrom) {
                for (let idFrom in artifact.linksFrom){
                    $('line[data-from=' + idFrom + '][data-to=' + idArtifact + ']').remove();
                }
            }
            $('line[data-from=' + idArtifact + '], line[data-to=' + idArtifact + ']').hide();
            $('#'+idArtifact).remove();
        } else if (something == "newInZP" || something == "newInZE") {
            this._ZP.addArtifact(artifact);
            let $element = this._createArtifactView(artifact);
            if (something == "newInZP"){
                $('.ZP').append($element);
            } else {
                $element.addClass('dropped').appendTo($('#' + artifact.ZE).find('.container'));

            }
        }
        if (!something || something == "newInZE"  ||  something == "newInZP"  || something == "position") {
            let $element = $('#' + artifact.id);
            console.log("update id" + source.id + "elt : " + $element.attr('id') + "parent.class : " + $element.parent().hasClass("ZP"));
            if ($element && $element.parent().hasClass("ZP")) {
                // $element.css('transform', 'translate(' + artifact.x + 'px, ' + artifact.y + 'px) scale('
                //     + artifact.scale + ') rotate(' + artifact.angle + 'deg)');
                $element.css('transform', 'translate(' + artifact.getX('px') +', '+ artifact.getY('px') + ') scale('
                    + artifact.scale + ') rotate(' + artifact.getAngle('deg') + ')');
                // let x = $element.offset().left + $element.width() / 2;
                // let y = $element.offset().top + $element.height() / 2;
                // let x = artifact.x +$element.width()/2;
                // let y = artifact.y +$element.height()/2;
                let x = artifact.getX('px');
                let y = artifact.getY('px');
                $('line[data-from=' + artifact.id + ']').each(function (index, line) {
                    line.setAttributeNS(null, 'x1', x);
                    line.setAttributeNS(null, 'y1', y);
                    let id2 = line.getAttributeNS(null, 'data-to');
                    let $element2 = $('#' + id2);
                    if ($element && $element.parent().hasClass("ZP") && $element2 && $element2.parent().hasClass("ZP")) {
                        $(line).show();
                    } else {
                        $(line).hide();
                    }
                }.bind(this));
                $('line[data-to=' + artifact.id + ']').each(function (index, line) {
                    line.setAttributeNS(null, 'x2', x);
                    line.setAttributeNS(null, 'y2', y);
                    let id2 = line.getAttributeNS(null, 'data-from');
                    let $element2 = $('#' + id2);
                    if ($element && $element.parent().hasClass("ZP") && $element2 && $element2.parent().hasClass("ZP")) {
                        $(line).show();
                    } else {
                        $(line).hide();
                    }
                }.bind(this));
            }
        } else if (something == "background") {
            console.log("background artifact: " + artifact.id + " " + artifact.isBackground);
            let $element = $('#' + artifact.id);
            if (artifact.isBackground) {
                console.log("background artifact: " + artifact.id);
                if (Object.keys(artifact.points).length === 0) {
                    this._connection.emitArtifactPartialUpdate(artifact.id, [{
                        op: 'add', path: '/points', value: {}
                    }]);
                }
                $('.ZP > .point').remove();
                $('line').remove();
                this._connection.emitArtifactPartialUpdate(artifact.id, [{
                    op: 'add', path: '/isBackground', value: true
                }]);
                $('#' + artifact.id).hide();
                $('.ZP')
                    .css('background-image', $element.css('background-image'))
                    .css('background-position', 'center')
                    .css('background-repeat', 'no-repeat')
                    .css('background-size', 'contain, cover')
                    .addClass('background');
                for (let id in artifact.points) {
                    // let $point = $('.template .artifact.point').clone();
                    console.log("background display point: " + id);
                    let point = artifact.getPoint(id);
                    point.visible = true;
                    //ToDo: remove obsolet code
                    // $('.ZP').append($point);
                    // $point.attr('id', id);
                    // $point.css('transform', 'translate(' + point.x + 'px, ' + point.y + 'px)');
                    // let x1 = $point.offset().left + $point.width()/2;
                    // let y1 = $point.offset().top + $point.height()/2;
                    // let id1 = id;
                    // for (let artId in point.linksTo){
                    //     console.log("artifact id : "+artId);
                    //     let $art=$('#'+artId), id2=artId, x2=x1, y2=y1;
                    //     if ($art && $art.offset()) {
                    //         x2 = $art.offset().left + $art.width()/2;
                    //         y2 = $art.offset().top + $art.height()/2;
                    //     }
                    //     let line = View.createLine(false, id1, x1, y1, id2, x2, y2);
                    // }
                }
            } else {
                this._connection.emitArtifactPartialUpdate(artifact.id, [{
                    op: 'add', path: '/isBackground', value: false
                }]);
                $('#' + artifact.id).show();
            }
        }
    }

    _createArtifactView(artifact){
        let idArtifact = artifact.id;
        let $element = $('#'+idArtifact);
        if ($element.length ==0 ) {
            $element = $('.template .artifact.' + artifact.type).clone();
            $element.attr('id', idArtifact);
        }
        $element.show();
        console.log("new artifact: " + idArtifact);
        let position = getRandomPositionInZP(artifact.position);
        artifact.position = position;
            //this._createArtifact(json).css('transform', 'translate(' + json.position.x + 'px, ' + json.position.y
        //     + 'px) scale(' + json.position.scale + ') rotate(' + json.position.angle + 'deg)').appendTo('.ZP');
        // $element.css('transform', 'translate(' + position.x + 'px, ' + position.y + 'px) scale('
        //     + position.scale + ') rotate(' + position.angle + 'deg)');
        // $element.show();
        // let x1 = $element.offset().left + $element.width() / 2;
        // let y1 = $element.offset().top + $element.height() / 2;
        let x1 = artifact.getX("px");
        let y1 = artifact.getY("px");
        let id1 = idArtifact;
        for (let artId in artifact.linksTo) {
            console.log("artifact To : " + artId);
            // let $art = $('#' + artId), id2 = artId, x2 = x1, y2 = y1;
            // if ($art && $art.offset()) {
            //     x2 = $art.offset().left + $art.width() / 2;
            //     y2 = $art.offset().top + $art.height() / 2;
            // }
            let id2 = artId, x2 = x1, y2 = y1;
            let artifactTo = this._ZP.getArtifact(artId);
            if (artifactTo) {
                x2 = artifactTo.getX('px');
                y2 = artifactTo.getY('px');
            }
            let line = View.createLine(false, id1, x1, y1, id2, x2, y2, (artifact.parent ? "annotation" : "link"));
        }
        for (let artId in artifact.linksFrom) {
            console.log("artifact From : " + artId);
            //let $art = $('#' + artId), id2 = artId, x2 = x1, y2 = y1;
            // if ($art && $art.offset()) {
            //     x2 = $art.offset().left + $art.width() / 2;
            //     y2 = $art.offset().top + $art.height() / 2;
            // }
            let id2 = artId, x2 = x1, y2 = y1;
            let artifactFrom = this._ZP.getArtifact(artId);
            if (artifactFrom) {
                x2 = artifactFrom.getX('px');
                y2 = artifactFrom.getY('px');
            }
            let line = View.createLine(false, id2, x2, y2, id1, x1, y1, (artifact.parent ? "annotation" : "link"));
        }
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
                        .css('background-size', 'contain, cover')
                        .addClass('background');
                    for (var id in artifact.points) {
                        let point = artifact.getPoint(id);
                        // var $point = $('.template .artifact.point').clone(),
                        //     point = artifact.getPoint(id);
                        // $('.ZP').append($point);
                        // $point.attr('id', id);
                        // $point.css('transform', 'translate(' + point.x + 'px, ' + point.y + 'px)');
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
}

class PointObserver extends ArtifactObserver {
    constructor(ZP, connection){
        super(ZP, connection);
        console.log("new PointObserver");    }
    // update (source, something) {
    //     let artifact = source;
    //     let $element = $('#'+artifact.id);
    //     console.log("update id"+source.id + "elt : " +$element.attr('id') + "parent.class : " + $element.parent().hasClass("ZP"));
    //     if ($element && $element.parent().hasClass("ZP")) {
    //         $element.css('transform', 'translate(' + artifact.x + 'px, ' + artifact.y + 'px) scale('
    //             + artifact.scale + ') rotate(' + artifact.angle + 'deg)');
    //     }
    //
    // }
}