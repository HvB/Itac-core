/* ------------------------- 
 * le menu est draggable
 * -------------------------
 */
interact('.menu').draggable({
    inertia: true,
    restrict: {restriction: "parent", endOnly: true, elementRect: {top: 0, left: 0, bottom: 1, right: 1}},
    autoScroll: true,
    onmove: function (event) {
        var $element = $(event.target),
            x = (parseFloat($element.attr('data-x')) || 0) + event.dx,
            y = (parseFloat($element.attr('data-y')) || 0) + event.dy,
            angle = parseFloat($element.attr('data-a'));
        $element.css('transform', 'translate(' + x + 'px, ' + y + 'px)' + (angle ? ' rotate(' + angle + 'deg)' : ''));
        $element.attr('data-x', x);
        $element.attr('data-y', y);
    }
}).gesturable({
    inertia: true,
    restrict: {restriction: "parent", endOnly: true, elementRect: {top: 0, left: 0, bottom: 1, right: 1}},
    autoScroll: true,
    onmove: function (event) {
        console.log(event.dx, event.dy, event.ds, event.da)
        var $element = $(event.target),
            x = (parseFloat($element.attr('data-x')) || 0) + event.dx,
            y = (parseFloat($element.attr('data-y')) || 0) + event.dy,
            angle = (parseFloat($element.attr('data-a')) || 0) + event.da;
        $element.css('transform', 'translate(' + x + 'px, ' + y + 'px) rotate(' + angle + 'deg)');
        $element.attr('data-x', x);
        $element.attr('data-y', y);
        $element.attr('data-a', angle);
    }
});

/* --------------------------------- 
 * permet d'ouvrir et fermer le menu
 * ---------------------------------
 */
interact('.hand').on('tap', function () {
    $('.menu').circleMenu($('ul').hasClass('circleMenu-open') ? 'close' : 'open');
});

/* ----------------------------------------- 
 * permet d'envoyer un artefact vers une ZP
 * ----------------------------------------
 */

interact('.circleMenu-open .send').dropzone({
    //accepter que les elements avec ce CSS selector
    accept: '.artefact',
    // il faut 10% de l'element overlap pour que le drop soit possible
    overlap: 0.1,
    // les evenements de drop:
    ondragenter: function (event) {
        var draggableElement = event.relatedTarget;   // l'objet ddeplacé
        var dropzoneElement = event.target;			  // le conteneur
        console.log("menu ITAC -> ZP.ondragenter , draggableElement=" + draggableElement);
        //$(event.relatedTarget)
        // on masque l'élément

        $(event.relatedTarget).find("h1").hide();
        $(event.relatedTarget).find("p").hide();
        dropzoneElement.classList.add('trash-target');
        draggableElement.classList.add('can-delete');
    },

    ondragleave: function (event) {
        event.target.classList.remove('trash-target');
        event.relatedTarget.classList.remove('can-delete');
        $(event.relatedTarget).find("h1").show();
        $(event.relatedTarget).find("p").show();
    },

    ondrop: function (event) {
        // bizarre bug js ? pour relatedTarget il faut le value et pas pour target
        var idAr = $(event.relatedTarget).attr('id');
        var idZPsource = zpdemande;
        var idZPcible = $(event.target).attr('data-ZP');
        console.log("menu ITAC -> ZP.ondrop : transfert ART = " + idAr + " de ZP=" + idZPsource + " vers ZP=" + idZPcible);
        socket.emit('EVT_Envoie_ArtefactdeZPversZP', idAr, idZPsource, idZPcible);
        console.log("menu ITAC -> ZP.ondrop : envoi sur scket de : [EVT_Envoie_ArtefactdeZPversZP]");
        $(event.relatedTarget).remove();
    },

    ondropdeactivate: function (event) {
        // remove active dropzone feedback
        event.target.classList.remove('drop-active');
        event.target.classList.remove('trash-target');
    }
});

/* ----------------------------------------- 
 * permet de supprimer un artefact 
 * ----------------------------------------
 */

interact('.circleMenu-open .trash').dropzone({
    //accepter que les elements avec ce CSS selector
    accept: '.artefact',
    // il faut 10% de l'element overlap pour que le drop soit possible
    overlap: 0.1,
    // les evenements de drop:
    ondragenter: function (event) {
        var draggableElement = event.relatedTarget;   // l'objet ddeplacé
        var dropzoneElement = event.target;			  // le conteneur

        //$(event.relatedTarget)
        // on masque l'élément
        $(event.relatedTarget).find("h1").hide();
        $(event.relatedTarget).find("p").hide();
        dropzoneElement.classList.add('trash-target');
        draggableElement.classList.add('can-delete');
    },

    ondragleave: function (event) {
        event.target.classList.remove('trash-target');
        event.relatedTarget.classList.remove('can-delete');
        $(event.relatedTarget).find("h1").show();
        $(event.relatedTarget).find("p").show();
    },

    ondrop: function (event) {
        var idAr = $(event.relatedTarget).context.attributes[0].value;
        console.log("menu ITAC -> suppresion ART = " + idAr);
        socket.emit('EVT_ArtefactDeletedFromZP', idAr);
        $(event.relatedTarget).remove();
    },

    ondropdeactivate: function (event) {
        // remove active dropzone feedback
        event.target.classList.remove('drop-active');
        event.target.classList.remove('trash-target');
    }
});

/* -----------------------------------------
 * permet de changer le fond avec un artefact de type image
 * ----------------------------------------
 */

interact('.circleMenu-open .background').dropzone({
    //accepter que les elements avec ce CSS selector
    accept: '.artefact.img',
    // il faut 10% de l'element overlap pour que le drop soit possible
    overlap: 0.1,
    // les evenements de drop:
    ondragenter: function (event) {
        event.target.classList.add('trash-target');
        event.relatedTarget.classList.add('can-delete');
    },

    ondragleave: function (event) {
        event.target.classList.remove('trash-target');
        event.relatedTarget.classList.remove('can-delete');
    },

    ondrop: function (event) {
        $('.ZP')
            .css('background-image', $(event.relatedTarget).css('background-image'))
            .css('background-position', 'center')
            .css('background-repeat', 'no-repeat')
            .css('background-size', 'contain');
        event.target.classList.remove('trash-target');
        event.relatedTarget.classList.remove('can-delete');
    }
});

/* -----------------------------------------
 * permet de revenir au fond original
 * ----------------------------------------
 */
interact('.circleMenu-open .background').on('hold', function (event) {
    $('.ZP')
        .css('background-image', '')
        .css('background-position', '')
        .css('background-repeat', '')
        .css('background-size', '');
});
