/* ==========================================
 *  les zones d'echange
 * ==========================================
 */
interact('.zoneEchange').dropzone({
    // --> accepter juste les element de la class artefact
    accept: '.artefact',
    // --> il faut 10% de l'element soit dans la zone pour que le drop est possible
    overlap: 0.1,
    // -- >les evenement de drop

    ondropactivate: function (event) {
        //activer la zone de drop
        $(event.target).addClass('drop-active');
    },

    // --> lorsque l artefact entre la zone
    ondragenter: function (event) {
        $(event.target).addClass('drop-target');
        $(event.relatedTarget).addClass('can-drop');
    },

    ondragleave: function (event) {
        //supprimer les classes ajoutées aprés le drop
        $(event.target).removeClass('drop-target');
        $(event.relatedTarget).removeClass('can-drop dropped-image dropped-msg left right top');

        // on recupeère les identifiant
        var idAr = event.relatedTarget.id;
        var idZE = event.target.id;
        console.log('ondragleave d un Artefact (' + idAr + ') de la ZE= ' + idZE + ' vers la ZP= ' + zpdemande);
        console.log('ondragleave d un Artefact --> emission sur soket de [EVT_EnvoieArtefactdeZEversZP] idSocket =' + socket.id + ' idAR=' + idAr + ' idZE=' + idZE + ' zpdemande=' + zpdemande);
        socket.emit('EVT_Envoie_ArtefactdeZEversZP', idAr, idZE, zpdemande);
        console.log('ondragleave d un Artefact --> [OK} evenement emis [EVT_EnvoieArtefactdeZEversZP] ');
        //revenir à la classe initialle
        //event.relatedTarget.classList.add('artefact');
        $(event.relatedTarget).find("p").show();
        //affichage du contenu
    },

    ondrop: function (event) {
        //les evenements aprés le drop
        var idAr = event.relatedTarget.id;
        var idZE = event.target.id;
        console.log('ondrop d un Artefact (' + idAr + ') vers ZE= ' + idZE);
        $(event.relatedTarget).removeClass('can-drop');
        console.log('ondrop d un Artefact --> className =' + $(event.relatedTarget).attr('class'));
        if (!$(event.relatedTarget).hasClass('dropped-msg') && !$(event.relatedTarget).hasClass('dropped-image')) {
            console.log('ondrop d un Artefact --> emission sur soket de [EVT_EnvoieArtefactdeZPversZE]');
            socket.emit('EVT_Envoie_ArtefactdeZPversZE', idAr, idZE);
        }
        //selon la classe (image ou artefact normal) on organise les drops (rotations et affichage)
        var titre = $(event.relatedTarget).find("h1").text(); //le titre de lartefact
        var message = $(event.relatedTarget).find("p").text();  //le contenu
        var background = $(event.relatedTarget).css('background-image'); //l'image
        $(event.relatedTarget).remove();
        if ($(event.relatedTarget).hasClass('img')) {
            $('<div id="' + event.relatedTarget.id + '" class="draggable artefact img dropped-image '
                + orientationZE[idZE] + '"><h1>' + titre + '</h1><p style="display:none">' + message + '</p></div>')
                .appendTo(event.target).css("background-image", background);
        } else {
            $('<div id="' + event.relatedTarget.id + '" class="draggable artefact dropped-msg '
                + orientationZE[idZE] + '"><h1>' + titre + '</h1><p style="display:none">' + message + '</p></div>')
                .appendTo(event.target);
        }
    },
    ondropdeactivate: function (event) {
        //supprimer le drop-active class de la zone de drop
        $(event.target).removeClass('drop-active drop-target');
    }
});

