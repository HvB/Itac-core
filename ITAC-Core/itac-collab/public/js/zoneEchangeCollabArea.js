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
        $(event.relatedTarget).removeClass('dropped-image dropped-msg left right top');
        $(event.relatedTarget).find("p").show();
        $(event.relatedTarget).remove().appendTo('#ZP');
    },

    ondragleave: function (event) {
        $(event.target).removeClass('drop-target');
        $(event.relatedTarget).removeClass('can-drop');
    },

    ondrop: function (event) {
        //les evenements aprés le drop
        var idAr = event.relatedTarget.id, idZE = event.target.id;
        console.log('ondrop d un Artefact (' + idAr + ') vers ZE= ' + idZE);
        console.log('ondrop d un Artefact --> className =' + $(event.relatedTarget).attr('class'));
        console.log('ondrop d un Artefact --> emission sur soket de [EVT_EnvoieArtefactdeZPversZE]');
        socket.emit('EVT_Envoie_ArtefactdeZPversZE', idAr, idZE);

        $(event.relatedTarget).find("p").hide();
        $(event.relatedTarget).remove().css('transform', '').appendTo(event.target);
        $(event.relatedTarget).removeClass('can-drop');
        $(event.relatedTarget).addClass($(event.relatedTarget).hasClass('img') ? 'dropped-image' : 'dropped-msg');
        $(event.relatedTarget).addClass(orientationZE[idZE]);
    },
    
    ondropdeactivate: function (event) {
        //supprimer le drop-active class de la zone de drop
        $(event.target).removeClass('drop-active drop-target');
    }
});

