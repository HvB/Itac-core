interact('.dropped-msg').gesturable({ //les artefact dans la ZE ne peuvent pas etre manipuler (zoom, rotation)
    enabled: true
});
interact('.artefact').draggable({
    inertia: true,
    restrict: {restriction: "parent", endOnly: true, elementRect: {top: 0, left: 0, bottom: 1, right: 1}},
    autoScroll: true,
    onstart: function(event) {
        var $element = $(event.target),
            offset = $element.offset();
        $element.attr('data-offset-x', offset.left).attr('data-offset-y', offset.top);
        $element.attr('data-x', 0).attr('data-y', 0);
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
            scale = parseFloat($element.attr('data-s')) || 1,
            angle = parseFloat($element.attr('data-a')) || 0;
        $element.css('transform', 'translate(' + (x + parseFloat($element.attr('data-offset-x'))) + 'px, '
            + (y + parseFloat($element.attr('data-offset-y'))) + 'px) scale(' + scale + ') rotate(' + angle + 'deg)');
        $element.attr('data-x', x);
        $element.attr('data-y', y);
    }
}).gesturable({
    inertia: true,
    restrict: {restriction: "parent", endOnly: true, elementRect: {top: 0, left: 0, bottom: 1, right: 1}},
    autoScroll: true,
    onstart: function() {
        var $element = $(event.target),
            offset = $element.offset();
        $element.attr('data-offset-x', offset.left).attr('data-offset-y', offset.top);
        $element.attr('data-x', 0).attr('data-y', 0);
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
        $element.css('transform', 'translate(' + (x + parseFloat($element.attr('data-offset-x'))) + 'px, '
            + (y + parseFloat($element.attr('data-offset-y'))) + 'px) scale(' + scale + ') rotate(' + angle + 'deg)');
        $element.attr('data-x', x);
        $element.attr('data-y', y);
        $element.attr('data-s', scale);
        $element.attr('data-a', angle);
    }
});
