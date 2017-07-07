/* ==========================================
 *  les zones d'echange
 * ==========================================
 */
interact('.ZE')
    .dropzone({
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
            $(event.relatedTarget).remove().appendTo('.ZP');
        },

        ondragleave: function (event) {
            // on recupeère les identifiant
            var idAr = event.relatedTarget.id, idZE = event.target.id;
            console.log('ondragleave d un Artefact (' + idAr + ') de la ZE= ' + idZE + ' vers la ZP= ' + zpdemande);
            console.log('ondragleave d un Artefact --> emission sur soket de [EVT_EnvoieArtefactdeZEversZP] idSocket =' + socket.id + ' idAR=' + idAr + ' idZE=' + idZE + ' zpdemande=' + zpdemande);
            socket.emit('EVT_Envoie_ArtefactdeZEversZP', idAr, idZE, zpdemande);
            console.log('ondragleave d un Artefact --> [OK} evenement emis [EVT_EnvoieArtefactdeZEversZP] ');

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
        },

        ondropdeactivate: function (event) {
            //supprimer le drop-active class de la zone de drop
            $(event.target).removeClass('drop-active drop-target');
        }
    })
    .draggable({
        onmove: function (event) {
            var $element = $(event.target),
                x = (parseFloat($element.attr('data-x')) || 0) + event.dx,
                y = (parseFloat($element.attr('data-y')) || 0) + event.dy,
                width = $('.ZP').width(),
                height = $('.ZP').height(),
                angle = parseFloat($element.attr('data-a')) || 0;
            if (event.pageX * height / width <= event.pageY) {
                if (height - event.pageX * height / width <= event.pageY) {
                    $element.attr('data-orientation', 'bottom');
                    angle = 0;
                } else {
                    $element.attr('data-orientation', 'left');
                    angle = 90;
                }
            } else {
                if (height - event.pageX * height / width <= event.pageY) {
                    $element.attr('data-orientation', 'right');
                    angle = 270;
                } else {
                    $element.attr('data-orientation', 'top');
                    angle = 180;
                }
            }
            $element.css('transform', 'translate(' + x + 'px, ' + y + 'px) rotate(' + angle + 'deg)');
            $element.attr('data-x', x);
            $element.attr('data-y', y);
            $element.attr('data-a', angle);
        },
        onend: function (event) {
            var $element = $(event.target),
                $ZP = $('.ZP'),
                offset = $element.offset(),
                x = parseFloat($element.attr('data-x')) || 0,
                y = parseFloat($element.attr('data-y')) || 0,
                width = $ZP.width(),
                height = $ZP.height(),
                angle = parseFloat($element.attr('data-a')) || 0;
            switch ($element.attr('data-orientation')) {
                case 'bottom':
                    y -= -height + $element.height();
                case 'top':
                    y -= offset.top;
                    if (offset.left < 0) {
                        x -= offset.left;
                    } else if (offset.left > width - $element.width()) {
                        x -= offset.left - width + $element.width();
                    }
                    break;
                case 'right':
                    x -= -width + $element.height();
                case 'left':
                    x -= offset.left;
                    if (offset.top < 0) {
                        y -= offset.top;
                    } else if (offset.top > height - $element.width()) {
                        y -= offset.top - height + $element.width();
                    }
                    break;
            }
            $element.css('transform', 'translate(' + x + 'px, ' + y + 'px) rotate(' + angle + 'deg)');
            $element.attr('data-x', x);
            $element.attr('data-y', y);
        }
    });

