/* ==========================================
 *  les zones de partage
 * ==========================================
 */
interact('.ZP').dropzone({
    //accepter just les element ayant la class artefact
    accept: '.artifact',
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
        $(event.relatedTarget).addClass('artifact');
    },

    ondrop: function (event) {
        //les evenements aprés le drop
        $(event.relatedTarget).removeClass('can-drop');
        $(event.relatedTarget).addClass('artifact');
    },

    ondropdeactivate: function (event) {
        //supprimer le drop-active class de la zone de drop
        $(event.target).removeClass('drop-active drop-target');
    }
});
