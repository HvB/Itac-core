/* ==========================================
 *  les zones de partage
 * ==========================================
 */
interact('.ZP')
    .dropzone({
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
    })
    .on('hold', function (event) {
        var $ZP = $(event.currentTarget);
        // if ($ZP.hasClass('background')) {
        var $artifact = $('.template .artifact.point').clone();
        $artifact.appendTo($ZP);
        var x = event.clientX - $artifact.width() / 2,
            y = event.clientY - $artifact.height() / 2,
            id = guid();
        $artifact.css('transform', 'translate(' + x + 'px, ' + y + 'px)');
        $artifact.attr('id', id).attr('data-x', x).attr('data-y', y);

        var shape = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        shape.setAttributeNS(null, 'class', 'temporary');
        shape.setAttributeNS(null, 'data-in', id);
        shape.setAttributeNS(null, "x1", event.clientX);
        shape.setAttributeNS(null, "y1", event.clientY);
        shape.setAttributeNS(null, "x2", event.clientX);
        shape.setAttributeNS(null, "y2", event.clientY);
        shape.setAttributeNS(null, "stroke", "black");
        shape.setAttributeNS(null, "stroke-width", 3);
        document.getElementsByTagName('svg')[0].appendChild(shape);

        var interaction = event.interaction;
        if (!interaction.interacting()) {
            interaction.start({name: 'drag'}, interact('line'), shape);
        }
        // }
    });
