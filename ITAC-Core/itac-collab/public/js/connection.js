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
        this._jsonPatchArtifactObserver = new JsonPatchArtifactObserver(ZP, this);
        this._animations = false;
    }

    get artifactObserver() {
        return this._artifactObserver;
    }
    get pointObserver() {
        return this._pointObserver;
    }
    get jsonPatchArtifactObserver() {
        return this._jsonPatchArtifactObserver;
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

        // on attends un peu avant d'accepter les animations lors de l'arrivee des artefacts
        setTimeout(()=> { this._animations = true;}, 10000);
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
            $point = $('.template > .artifact.point').clone(),
            nbZE = $('.ZP > .ZE').length;
        $('.ZP > .ZE').removeClass('n' + nbZE).addClass('n' + (nbZE + 1));
        $element.addClass('n' + (nbZE + 1)).addClass('ZE' + (nbZE + 1)).attr('id', idZE).appendTo('.ZP');
        $element.find('.login').text(login);
        $element.find('img').attr('id', 'avatar' + posAvatar);
        $element.find('.tool').append($point.addClass('dropped unpinned').removeClass("pinned")).hide();

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
        let artifact = Artifact.new(json.id, json);
        this._ZP.addArtifact(artifact);
        artifact.addObserver(this._artifactObserver);
        artifact.addObserver(this._jsonPatchArtifactObserver);
        if (artifact.points){
            for (var id in artifact.points){
                //this._ZP.addArtifact(id, artifact.getPoint(id));
                artifact.getPoint(id).addObserver(this._pointObserver);
                artifact.getPoint(id).addObserver(this._jsonPatchArtifactObserver);
            }
        }
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
        this._ZP.getZE(idZE).addArtifact(json.id);
        this._createArtifact(json, "ZE").newInZE();
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
        this._createArtifact(json, "ZP");
        let artifact = this._ZP.getArtifact(json.id);
        let $element = this._artifactObserver._createArtifactView(artifact);
        $element.css('z-index', Z_INDEX++);
        let x = 0;
        let y = 0;
        if (this._animations && artifact.ZE /* && ! artifact.isBackground */ ) {
            let $source = $('#'+artifact.ZE+'.ZE');
            let ZE =  this._ZP.getZE(artifact.ZE);
            $element.addClass('newInZP');
            if ($source.length > 0) {
                let x1 = 'calc( '+ $source.css('left') + ' + ' + ZE.x + 'px + ' + $source.width()/2 + 'px)';
                let y1 = 'calc( '+ $source.css('top') + ' + ' + ZE.y + 'px + ' + $source.height()/2 + 'px)';
                let angle = ZE.angle;
                $element.css('transform', 'translate(' + x1 + ', ' + y1 + ') rotate(' + angle + 'deg)');
            } else {
                let x = this._ZP.menu.x;
                let y = this._ZP.menu.y;
                let angle = this._ZP.menu.angle;
                $element.css('transform', 'translateX(calc(50vw + ' + x + 'px)) translateY(calc(50vh + ' + y + 'px)) rotate(' + angle + 'deg)');
            }
            $element.appendTo('.ZP').show();
            setTimeout(()=>{$element.css('transform', 'translate(50vw, 50vh) translate(' + artifact.getX('vh', 'center') +', '+ artifact.getY('vh', 'center') + ') scale('
                + artifact.scale + ') rotate(' + artifact.getAngle('deg') + ')');
            });
            setTimeout((function(){
                $element.removeClass('newInZP');
                artifact.newInZP();
            }).bind(this),500);
        } else {
            artifact.newInZP();
        }
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

//ToDo: deplacer les ArtefactObserver ailleurs ?
class ArtifactObserver {
    constructor(ZP, connection){
        this._ZP = ZP;
        this._connection = connection;
        console.log("new ArtifactObserver");
    }
    update (source, event) {
        console.log('ArtifactObserver update  - artifact id: '+ source.id + 'event.type: ' + event.type);
        let artifact = source;
        if (event.status == "deleted") {
            console.log("ArtifactObserver status: " + event.status);
            let idArtifact = artifact.id;
            this._ZP.removeArtifact(idArtifact);
            console.log("deleted "+idArtifact+" "+artifact.type+" - "+ARTIFACT_POINT);
            $('line[data-from=' + idArtifact + ']').each(function (index, element) {
                let $link = $(element);
                let artifactTo = this._ZP.getArtifact($link.attr('data-to'));
                if (artifactTo && artifactTo.removeLinkFrom instanceof Function) {
                    artifactTo.removeLinkFrom(artifact.id);
                }
                $link.remove();
            }.bind(this));
            $('line[data-to=' + idArtifact + ']').each(function (index, element) {
                let $link = $(element);
                let artifactFrom = this._ZP.getArtifact($link.attr('data-from'));
                if (artifactFrom && artifactFrom.removeLinkTo instanceof Function) {
                    artifactFrom.removeLinkTo(artifact.id);
                }
                $link.remove();
            }.bind(this));
            $('#'+idArtifact).remove();
        } else if (event.status == "migrated"  || event.status == "hidden") {
            let idArtifact = artifact.id;
            //this._ZP.removeArtifact(idArtifact);
            if (artifact.linksTo) {
                for (let idTo in artifact.linksTo){
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
        } else if (event.status == "newInZP" || event.status == "newInZE") {
            this._ZP.addArtifact(artifact);
            let $element = this._createArtifactView(artifact);
            if (event.status == "newInZP"){
                $element.appendTo('.ZP');
                $element.show();
                if (artifact.isBackground) {
                    this._ZP.background = artifact.id;
                }
            } else {
                $element.addClass('dropped').appendTo($('#' + artifact.idContainer).find('.container'));
                $element.show();
             }
        } else if (event.status == "inZP") {
            let $element = $('#'+artifact.id);
            $element.appendTo('.ZP');
            $element.show();
        } else  if (event.status == "inZE") {
            let $element = $('#'+artifact.id);
            $element.css('transform', '').addClass('dropped').appendTo($('#' + artifact.idContainer).find('.container'));
            $element.show();
        } else if (event.type == "ArtifactStartMoveEvent") {
            let $element = $('#'+artifact.id);
            $element.removeClass('active');
            $('svg [data-artifact=' + artifact.id + ']').remove();
            $element.appendTo(".ZP");
            // $element.css('transform', 'translate(' + artifact.getX('px') +', '+ artifact.getY('px') + ') scale('
            //     + artifact.scale + ') rotate(' + artifact.getAngle('deg') + ')');
            $element.css('z-index', Z_INDEX);
            Z_INDEX++;
        }
        if (!event || event.status == "newInZE"  ||  event.status == "newInZP"  || event.type == "ArtifactMoveEvent") {
            let $element = $('#' + artifact.id);
            console.log("update id" + source.id + "elt : " + $element.attr('id') + "parent.class : " + $element.parent().hasClass("ZP"));
            if ($element.parent().hasClass("ZP")) {
                $element.css('transform', 'translate(50vw, 50vh) translate(' + artifact.getX('vh','center') +', '+ artifact.getY('vh', 'center') + ') scale('
                    + artifact.scale + ') rotate(' + artifact.getAngle('deg') + ')');
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
        } else if (event.status == "background") {
            console.log("background artifact: " + artifact.id + " " + artifact.isBackground);
            let $element = $('#' + artifact.id);
            if (artifact.isBackground) {
                console.log("background artifact: " + artifact.id);
                $('.ZP > .point').remove();
                $('line.annotation').remove();
                $('.ZP')
                    .css('background-image', $element.css('background-image'))
                    .css('background-position', 'center')
                    .css('background-repeat', 'no-repeat')
                    .css('background-size', 'contain, cover')
                    .addClass('background');
            }
        }
    }

    //ToDo: deplacer cette methode a un meilleur endroit (View ?)
    _createArtifactView(artifact){
        // on verifie que l'artefact est bien visible - sinon on le replace
        let position = getRandomPositionInZP(artifact.position);
        artifact.position = position;
        let idArtifact = artifact.id;
        let $element = $('#'+idArtifact);
        if ($element.length ==0 ) {
            console.log("creation de la vue pour l'artifact: " + idArtifact + '(' + artifact.type + ')');
            $element = $('.template > .artifact.' + artifact.type).clone();
            $element.attr('id', idArtifact);
            // creation des vues pour les liens de l'artefact
            let x1 = artifact.getX("px");
            let y1 = artifact.getY("px");
            let id1 = idArtifact;
            // liens sortants
            for (let artId in artifact.linksTo) {
                let id2 = artId, x2 = x1, y2 = y1;
                let artifactTo = this._ZP.getArtifact(artId);
                if (artifactTo) {
                    x2 = artifactTo.getX('px');
                    y2 = artifactTo.getY('px');
                }
                let line = View.createLine(false, id1, x1, y1, id2, x2, y2, (artifact.parent ? "annotation" : "link"));
            }
            // liens entrants
            for (let artId in artifact.linksFrom) {
                let id2 = artId, x2 = x1, y2 = y1;
                let artifactFrom = this._ZP.getArtifact(artId);
                if (artifactFrom) {
                    x2 = artifactFrom.getX('px');
                    y2 = artifactFrom.getY('px');
                }
                let line = View.createLine(false, id2, x2, y2, id1, x1, y1, (artifact.parent ? "annotation" : "link"));
            }
            // contenu de l'artefact
            switch (artifact.type) {
                case ARTIFACT_MESSAGE:
                    $element.find('h1').text(artifact.title);
                    $element.find('p').first().text(artifact.content);
                    break;
                case ARTIFACT_IMAGE:
                    $element.css('background-image', 'url(' + artifact.content + ')');
            }
            // generation de l'historique
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
            $element.hide();
        }
        return $element;
    }
}

//ToDo: deplacer les ArtefactObserver ailleurs ?
class PointObserver extends ArtifactObserver {
    constructor(ZP, connection){
        super(ZP, connection);
    }
}

//ToDo: deplacer les ArtefactObserver ailleurs ?
class JsonPatchArtifactObserver {
    constructor(ZP, connection){
        this._ZP = ZP;
        this._connection = connection;
    }
    update (source, event) {
        console.log('JsonPatchArtifactObserver update - artifact id: '+ source.id + 'event.type: ' + event.type);
        if (source && event) {
            let artifact = source;
            if (event.status == "deleted") {
                let idArtifact = artifact.id;
                if (artifact.type !==  ARTIFACT_POINT) {
                    this._connection.emitRemovedArtifactInZP(idArtifact);
                } else {
                    artifact.parent.removePoint(idArtifact);
                }
            } else if (event.status == "inZP") {
                if (event.params) {
                    // c'est un transfert de ZE vers la ZP
                    let idZE = event.params.ZE;
                    let idZP = event.params.ZP;
                    let idAr = source.id;
                    console.log('transfert Artefact de ZE vers ZP --> emission sur socket de [EVT_EnvoieArtefactdeZEversZP]');
                    this._connection.emitArtifactFromZEToZP(idAr, idZE);
                    console.log('transfert Artefact de ZE vers ZP --> [OK} evenement emis [EVT_EnvoieArtefactdeZEversZP]');
                    this._ZP.getZE(idZE).removeArtifact(idAr);
                }
            } else  if (event.status == "inZE") {
                if (event.params) {
                    // c'est un transfert de la ZP vers une ZE
                    let idZE = event.params.ZE;
                    let idZP = event.params.ZP;
                    let idAr = artifact.id;
                    console.log('transfert Artefact de ZP vers ZE --> emission sur soket de [EVT_EnvoieArtefactdeZPversZE]');
                    this._connection.emitArtifactFromZPToZE(idAr, idZE);
                    console.log('transfert Artefact de ZP vers ZE -->[OK} evenement emis [EVT_EnvoieArtefactdeZPversZE]');
                    this._ZP.getZE(idZE).addArtifact(idAr);
                }
            } else if (event.type === 'ArtifactEndMoveEvent') {
                let jsonPatchTargetId = source.id;
                let jsonPatchPath = '/position';
                let jsonPatchValue = event.jsonPosition;
                if (source.parent) {
                    jsonPatchTargetId = source.parent.id;
                    jsonPatchPath = '/points/' + source.id + jsonPatchPath;
                }
                if (jsonPatchTargetId) {
                    this._connection.emitArtifactPartialUpdate(jsonPatchTargetId, [{
                        op: 'add',
                        path: jsonPatchPath,
                        value: jsonPatchValue
                    }]);
                }
            } else if (event.type === 'ArtifactPropertyValueChangedEvent') {
                let jsonPatchTargetId = source.id;
                let jsonPatchPath = '/';
                if (source.parent) {
                    jsonPatchTargetId = source.parent.id;
                    jsonPatchPath = '/points/' + source.id + jsonPatchPath;
                }
                let modifications = event.modifications;
                if (jsonPatchTargetId && modifications && modifications.length > 0) {
                    let patch = [];
                    for (let i in modifications){
                        let modif = modifications[i];
                        let path = jsonPatchPath + modif.property;
                        let op = 'replace';
                        if (modif.old !== undefined && modif.new === undefined) {
                            op = 'remove';
                        } else if (modif.old === undefined && modif.new !== undefined) {
                            op = 'add'
                        }
                        patch.push({op: op, path: path, value: modif.new });
                    }
                    this._connection.emitArtifactPartialUpdate(jsonPatchTargetId, patch);
                }
            } else if (event.type === 'ArtifactPropertyListChangedEvent') {
                let jsonPatchTargetId = source.id;
                let jsonPatchPath = '/' + event.property;
                let jsonPatchValue = event.value;
                if (source.parent) {
                    jsonPatchTargetId = source.parent.id;
                    jsonPatchPath = '/points/' + source.id + jsonPatchPath;
                }
                if (! event.emptyList) {
                    this._connection.emitArtifactPartialUpdate(jsonPatchTargetId, [{
                        op: event.op,
                        path: jsonPatchPath+ '/' + event.key,
                        value: jsonPatchValue
                    }]);
                } else {
                    let value = {};
                    value[event.key] = event.value;
                    this._connection.emitArtifactPartialUpdate(jsonPatchTargetId, [{
                        op: event.op,
                        path: jsonPatchPath,
                        value: value
                    }]);
                }
            }
        }
    }
}
