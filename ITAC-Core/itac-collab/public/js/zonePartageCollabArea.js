/* ==========================================
 *  les zones de partage
 * ==========================================
 */
interact('#ZP').dropzone({
    //accepter just les element ayant la class artefact
    accept: '.artefact',
    // il faut 50% de l'element soit dans la zone pour que le drop est possible
    overlap: 0.5,

    // les evenement de drop
    ondropactivate: function (event) {
        // activer la zone de drop
        $(event.target).addClass('drop-active');
    },

    ondragenter: function (event) {
        // la possibilité de drop
        $(event.target).addClass('drop-target');
        $(event.relatedTarget).addClass('can-drop');
    },

    ondragleave: function (event) {
        //supprimer le feedback de drop
        $(event.target).removeClass('drop-target');
        $(event.relatedTarget).removeClass('can-drop');
        $(event.relatedTarget).addClass('artefact');
    },

    ondrop: function (event) {
        // on recupeère les identifiant
        var idAr = event.relatedTarget.id, idZE = event.target.id;
        console.log('ondragleave d un Artefact (' + idAr + ') de la ZE= ' + idZE + ' vers la ZP= ' + zpdemande);
        console.log('ondragleave d un Artefact --> emission sur soket de [EVT_EnvoieArtefactdeZEversZP] idSocket =' + socket.id + ' idAR=' + idAr + ' idZE=' + idZE + ' zpdemande=' + zpdemande);
        socket.emit('EVT_Envoie_ArtefactdeZEversZP', idAr, idZE, zpdemande);
        console.log('ondragleave d un Artefact --> [OK} evenement emis [EVT_EnvoieArtefactdeZEversZP] ');

        //les evenements aprés le drop
        $(event.relatedTarget).removeClass('can-drop');
        $(event.relatedTarget).addClass('artefact');
    },

    ondropdeactivate: function (event) {
        //supprimer le drop-active class de la zone de drop
        $(event.target).removeClass('drop-active drop-target');
    }
});
