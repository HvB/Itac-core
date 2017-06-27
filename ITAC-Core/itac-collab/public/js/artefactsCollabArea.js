interact('.dropped-msg').gesturable({ //les artefact dans la ZE ne peuvent pas etre manipuler (zoom, rotation)
    enabled: true
});
interact('.artefact')
    .draggable({inertia: true})
    .gesturable({inertia: true})
    .on('dragstart gesturestart', function (event) {
        var $element = $(event.target),
            offset = $element.offset();
        $element.attr('data-offset-x', offset.left).attr('data-offset-y', offset.top);
        $element.attr('data-x', 0).attr('data-y', 0);

        //appliquer une z-index max pour l'artefact en cours de manipulation
        var maxZ = Math.max.apply(null,
            $.map($('body > *'), function (e, n) {
                if ($(e).css('position') != 'static')
                    return parseInt($(e).css('z-index')) || 1;
            }));
        $element.css('z-index', maxZ + 1);
    }).on('dragmove gesturemove', function (event) {
        // keep the dragged position in the data-x/data-y attributes
        var $element = $(event.target),
            x = parseFloat($element.attr('data-x')) + event.dx,
            y = parseFloat($element.attr('data-y')) + event.dy,
            scaleX = $element.get(0).getBoundingClientRect().width / $element.get(0).offsetWidth,
            scaleY = $element.get(0).getBoundingClientRect().height / $element.get(0).offsetHeight,
            scale = (scaleX + scaleY) / 2,
            matrix = $element.css('transform'),
            angle = 0;
        if (matrix !== 'none') {
            var values = matrix.split('(')[1].split(')')[0].split(',');
            angle = Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI));
        }

        $element.attr('data-x', x);
        $element.attr('data-y', y);
        $element.css('transform', 'translate(' + (x + parseFloat($element.attr('data-offset-x'))) + 'px, '
            + (y + parseFloat($element.attr('data-offset-y'))) + 'px) scale(' + scale + ') rotate(' + angle + 'deg)');
    }
);
