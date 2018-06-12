$(document).ready(function () {
    var timeout;

    $('ul.menu li:not(:first-child)').each(function (index, $element) {
        var step = 360 / $('ul.menu li:not(:first-child)').length,
            radius = 360,
            angle = step * index * Math.PI / 180,
            x = -Math.round(radius * Math.cos(angle)),
            y = Math.round(radius * Math.sin(angle));
        $($element).css('top', x + 'px').css('left', y + 'px');
    });

    interact('.menu li:first-child')
        .gesturable({
            onmove: (function (event) {
                var target = event.target,
                    angle = (parseFloat(target.getAttribute('data-angle')) || 0) + event.da;
                target.style.webkitTransform =
                    target.style.transform =
                        'rotate(' + angle + 'deg)';
                target.setAttribute('data-angle', angle);
            }).bind(this)
        })
        .dropzone({
            ondragenter: function (event) {
                $('.menu li:first-child').addClass('ready');
            },
            ondragleave: function (event) {
                $('.menu li:first-child').removeClass('ready');
            },
            ondrop: function (event) {
                let $target = $(event.dragEvent.target),
                    url = $target.attr('data-url');
                clearTimeout(timeout);
                $('.menu li:first-child')
                    .text($target.attr('data-name'))
                    .addClass('no-background');
                $target.remove();
                timeout = setTimeout(function () {
                    window.location.href = window.location.href + url;
                }, 1000);
            }
        });

    interact('.menu li:not(:first-child)')
        .draggable({
            onmove: function (event) {
                var target = event.target,
                    x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                    y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                target.style.webkitTransform =
                    target.style.transform =
                        'translate(' + x + 'px, ' + y + 'px)';
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            },
            onend: function (event) {
                var target = event.target;
                target.style.webkitTransform =
                    target.style.transform =
                        'translate(' + 0 + 'px, ' + 0 + 'px)';
                target.setAttribute('data-x', 0);
                target.setAttribute('data-y', 0);
            }
        })
        .on('tap', function (event) {
            let $item = $('.menu li:first-child');
            clearTimeout(timeout);
            $item.text($(event.target).attr('data-name')).addClass('no-background');
            timeout = setTimeout(function () {
                $item.text('').removeClass('no-background');
            }, 3000);
        });
});
