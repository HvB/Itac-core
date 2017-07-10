// interact('.dropped').gesturable({ //les artefact dans la ZE ne peuvent pas etre manipuler (zoom, rotation)
//     enabled: true
// });
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
                scale = parseFloat($element.attr('data-s')) || 1,
                angle = parseFloat($element.attr('data-a')) || 0;
            $element.css('transform', 'translate(' + x + 'px, ' + y + 'px) scale(' + scale + ') rotate(' + angle + 'deg)');
            $element.attr('data-x', x);
            $element.attr('data-y', y);
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
        }
    })
    .on('tap', function(event) {
        var $element = $(event.currentTarget);
        if ($element.hasClass('active')) {
            $element.removeClass('active');
            $('svg [data-artifact=' + $element.attr('id') + ']').remove();
        } else {
            $element.addClass('active');
            var shape = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            shape.setAttributeNS(null, "data-ZE", 1);
            shape.setAttributeNS(null, "data-artifact", $element.attr('id'));
            shape.setAttributeNS(null, "x1", $('.ZE1').offset().left + $('.ZE1').width() / 2);
            shape.setAttributeNS(null, "y1", $('.ZE1').offset().top + $('.ZE1').height() / 2);
            shape.setAttributeNS(null, "x2", parseFloat($element.attr('data-x')) + $element.width() / 2);
            shape.setAttributeNS(null, "y2", parseFloat($element.attr('data-y')) + $element.height() / 2);
            shape.setAttributeNS(null, "stroke", "black");
            shape.setAttributeNS(null, "stroke-width", 3);
            document.getElementsByTagName('svg')[0].appendChild(shape);
        }
    });
