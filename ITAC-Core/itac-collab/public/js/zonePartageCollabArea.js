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
        event.target.classList.add('drop-active');
    },

    ondragenter: function (event) {
        var draggableElement = event.relatedTarget,
            zoneEchangeElement = event.target;
        // la possibilité de drop
        zoneEchangeElement.classList.add('drop-target');
        draggableElement.classList.add('can-drop');
    },

    ondragleave: function (event) {
        //supprimer le feedback de drop
        event.target.classList.remove('drop-target');
        event.relatedTarget.classList.remove('can-drop');
        event.relatedTarget.classList.remove('dropped');
        event.relatedTarget.classList.add('artefact');
    },

    ondrop: function (event) {
        //les evenements aprés le drop
        // event.relatedTarget.classList.add('dropped');
        event.relatedTarget.classList.remove('can-drop');
        event.relatedTarget.classList.add('artefact');
    },

    ondropdeactivate: function (event) {
        //supprimer le drop-active class de la zone de drop
        event.target.classList.remove('drop-active');
        event.target.classList.remove('drop-target');
    }
});
