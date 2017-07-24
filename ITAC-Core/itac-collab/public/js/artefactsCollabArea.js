// interact('.dropped').gesturable({ //les artefact dans la ZE ne peuvent pas etre manipuler (zoom, rotation)
//     enabled: true
// });
interact('.ZP > .artifact.message, .ZP > .artifact.image')
    .dropzone({
        //accepter just les element ayant la class artefact
        accept: 'line',

        // les evenement de drop
        ondropactivate: function (event) {
            // activer la zone de drop
            $(event.target).addClass('drop-active');
        },

        ondragenter: function (event) {
            // la possibilité de drop
            $(event.target).addClass('drop-target');
        },

        ondragleave: function (event) {
            //supprimer le feedback de drop
            $(event.target).removeClass('drop-target');
        },

        ondrop: function (event) {
            //les evenements aprés le drop
            var $target = $(event.target),
                shape = event.relatedTarget,
                $shape = $(shape);
            if ($('line[data-from=' + $shape.attr('data-from') + '][data-to=' + $target.attr('id') + ']').length == 0) {
                shape.setAttributeNS(null, "x2", parseFloat($target.attr('data-x')) + $target.width() / 2);
                shape.setAttributeNS(null, "y2", parseFloat($target.attr('data-y')) + $target.height() / 2);
                $shape.attr('data-to', $target.attr('id'));
                $shape.removeClass('temporary');
            } else {
                $('line[data-from=' + $shape.attr('data-from') + '].temporary').remove();
            }
        },

        ondropdeactivate: function (event) {
            //supprimer le drop-active class de la zone de drop
            var $shape = $(event.relatedTarget);
            $(event.target).removeClass('drop-active drop-target');
            if ($shape.hasClass('temporary')) {
                var id = $shape.attr('data-from');
                $shape.remove();
                if ($('line[data-from=' + id + ']').length == 0) {
                    var $element = $('#' + id);
                    if ($element.hasClass('point')) {
                        $element.remove();
                    }
                }
            }
        }
    });
interact('.artifact')
    .draggable({
        inertia: true,
        restrict: {restriction: "parent", endOnly: true, elementRect: {top: 0, left: 0, bottom: 1, right: 1}},
        autoScroll: true,
        onstart: function (event) {
            var $element = $(event.target),
                offset = $element.offset();
            if ($(event.target).hasClass('dropped')) {
                $element.attr('data-x', offset.left).attr('data-y', offset.top);
            }
            $element.removeClass('active');
            $('svg [data-artifact=' + $element.attr('id') + ']').remove();
            $element.css('z-index', ZINDEX);
            ZINDEX++;
        },
        onmove: function (event) {
            var $element = $(event.target),
                x = (parseFloat($element.attr('data-x')) || 0) + event.dx,
                y = (parseFloat($element.attr('data-y')) || 0) + event.dy,
                scale = parseFloat($element.attr('data-s')) || 1,
                angle = parseFloat($element.attr('data-a')) || 0;
            $element.css('transform', 'translate(' + x + 'px, ' + y + 'px) scale(' + scale + ') rotate(' + angle + 'deg)');
            $element.attr('data-x', x);
            $element.attr('data-y', y);

            $('line[data-from=' + $element.attr('id') + ']').each(function (index, element) {
                var $element = $(element);
                element.setAttributeNS(null, 'x1', parseFloat($element.attr('x1')) + event.dx);
                element.setAttributeNS(null, 'y1', parseFloat($element.attr('y1')) + event.dy);
            });
            $('line[data-to=' + $element.attr('id') + ']').each(function (index, element) {
                var $element = $(element);
                element.setAttributeNS(null, 'x2', parseFloat($element.attr('x2')) + event.dx);
                element.setAttributeNS(null, 'y2', parseFloat($element.attr('y2')) + event.dy);
            });
        }
    });
interact('.ZP > .artifact')
    .gesturable({
        inertia: true,
        restrict: {restriction: "parent", endOnly: true, elementRect: {top: 0, left: 0, bottom: 1, right: 1}},
        autoScroll: true,
        onstart: function (event) {
            var $element = $(event.target),
                offset = $element.offset();
            if ($element.hasClass('dropped')) {
                $element.attr('data-x', offset.left).attr('data-y', offset.top);
            }
            if ($element.hasClass('active')) {
                $element.removeClass('active');
                $('svg [data-artifact=' + $element.attr('id') + ']').remove();
            }
            var maxZ = Math.max.apply(null,
                $.map($('body > *'), function (e, n) {
                    if ($(e).css('position') != 'static')
                        return parseInt($(e).css('z-index')) || 1;
                }));
            $element.css('z-index', maxZ + 1);
        },
        onmove: function (event) {
            var $element = $(event.target),
                x = (parseFloat($element.attr('data-x')) || 0) + event.dx,
                y = (parseFloat($element.attr('data-y')) || 0) + event.dy,
                scale = (parseFloat($element.attr('data-s')) || 1) + event.ds,
                angle = (parseFloat($element.attr('data-a')) || 0) + event.da;
            $element.css('transform', 'translate(' + x + 'px, ' + y + 'px) scale(' + scale + ') rotate(' + angle + 'deg)');
            $element.attr('data-x', x);
            $element.attr('data-y', y);
            $element.attr('data-s', scale);
            $element.attr('data-a', angle);
            
            $('line[data-from=' + $element.attr('id') + ']').each(function (index, element) {
                var $element = $(element);
                element.setAttributeNS(null, 'x1', parseFloat($element.attr('x1')) + event.dx);
                element.setAttributeNS(null, 'y1', parseFloat($element.attr('y1')) + event.dy);
            });
            $('line[data-to=' + $element.attr('id') + ']').each(function (index, element) {
                var $element = $(element);
                element.setAttributeNS(null, 'x2', parseFloat($element.attr('x2')) + event.dx);
                element.setAttributeNS(null, 'y2', parseFloat($element.attr('y2')) + event.dy);
            });
        }
    })
    .on('tap', function (event) {
        var $artifact = $(event.currentTarget);
        $artifact.css('z-index', ZINDEX);
        ZINDEX++;
        if ($artifact.hasClass('active')) {
            $artifact.removeClass('active');
            $('svg [data-artifact=' + $artifact.attr('id') + ']').remove();
        } else {
            var shape = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            $ZE = $('#' + $artifact.attr('data-ze'));
            $artifact.addClass('active');
            shape.setAttributeNS(null, 'data-ze', $artifact.attr('data-ze'));
            shape.setAttributeNS(null, 'data-artifact', $artifact.attr('id'));
            switch ($ZE.attr('data-orientation')) {
                case 'top':
                case 'bottom':
                    shape.setAttributeNS(null, "x1", $ZE.offset().left + $ZE.width() / 2);
                    shape.setAttributeNS(null, "y1", $ZE.offset().top + $ZE.height() / 2);
                    break;
                case 'left':
                case 'right':
                    shape.setAttributeNS(null, "x1", $ZE.offset().left + $ZE.height() / 2);
                    shape.setAttributeNS(null, "y1", $ZE.offset().top + $ZE.width() / 2);
            }
            shape.setAttributeNS(null, "x2", parseFloat($artifact.attr('data-x')) + $artifact.width() / 2);
            shape.setAttributeNS(null, "y2", parseFloat($artifact.attr('data-y')) + $artifact.height() / 2);
            shape.setAttributeNS(null, "stroke", "black");
            shape.setAttributeNS(null, "stroke-width", 3);
            document.getElementsByTagName('svg')[0].appendChild(shape);
        }
    });
