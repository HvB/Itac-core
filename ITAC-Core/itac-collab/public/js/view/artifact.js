// interact('.dropped').gesturable({ //les artefact dans la ZE ne peuvent pas etre manipuler (zoom, rotation)
//     enabled: true
// });
class ArtifactView extends View {
    constructor(ZP, connection) {
        super(ZP, connection);
    }

    _initialize() {
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

                ondrop: (function (event) {
                    //les evenements aprés le drop
                    var $target = $(event.target),
                        artifact = this._ZP.getArtifact($target.attr('id')),
                        shape = event.relatedTarget,
                        $shape = $(shape);
                    if ($('line[data-from=' + $shape.attr('data-from') + '][data-to=' + artifact.id + ']').length == 0) {
                        shape.setAttributeNS(null, "x2", artifact.x + $target.width() / 2);
                        shape.setAttributeNS(null, "y2", artifact.y + $target.height() / 2);
                        $shape.attr('data-to', artifact.id);
                        $shape.removeClass('temporary');
                    } else {
                        $('line[data-from=' + $shape.attr('data-from') + '].temporary').remove();
                    }
                }).bind(this),

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
                onstart: (function (event) {
                    var $element = $(event.target), artifact;
                    if ($element.hasClass('point') && this._ZP.background) {
                        if ($element.hasClass('dropped')) {
                            var idZE = $element.parents('.ZE').attr('id'),
                                tool = this._ZP.getZE(idZE).tool;
                            tool.point.ZE = idZE;
                            this._ZP.getArtifact(this._ZP.background).addPoint(tool.point);
                            tool.reset();
                        }
                        artifact = this._ZP.getArtifact(this._ZP.background).getPoint($element.attr('id'));
                    } else {
                        artifact = this._ZP.getArtifact($element.attr('id'));
                    }
                    if (artifact) {
                        if ($element.hasClass('dropped')) {
                            var offset = $element.offset();
                            artifact.x = offset.left;
                            artifact.y = offset.top;
                        }
                        $element.removeClass('active');
                        // $('svg [data-artifact=' + artifact.id + ']').remove();
                        $element.css('z-index', Z_INDEX);
                        Z_INDEX++;
                    }
                }).bind(this),
                onmove: (function (event) {
                    var $element = $(event.target),
                        artifact;
                    if ($element.hasClass('point') && this._ZP.background) {
                        artifact = this._ZP.getArtifact(this._ZP.background).getPoint($element.attr('id'));
                    } else {
                        artifact = this._ZP.getArtifact($element.attr('id'));
                    }
                    if (artifact) {
                        artifact.x += event.dx;
                        artifact.y += event.dy;
                        $element.css('transform', 'translate(' + artifact.x + 'px, ' + artifact.y + 'px) scale('
                            + artifact.scale + ') rotate(' + artifact.angle + 'deg)');

                        // $('line[data-from=' + artifact.id + ']').each(function (index, element) {
                        //     var $element = $(element);
                        //     element.setAttributeNS(null, 'x1', parseFloat($element.attr('x1')) + event.dx);
                        //     element.setAttributeNS(null, 'y1', parseFloat($element.attr('y1')) + event.dy);
                        // });
                        // $('line[data-to=' + artifact.id + ']').each(function (index, element) {
                        //     var $element = $(element);
                        //     element.setAttributeNS(null, 'x2', parseFloat($element.attr('x2')) + event.dx);
                        //     element.setAttributeNS(null, 'y2', parseFloat($element.attr('y2')) + event.dy);
                        // });
                    }
                }).bind(this)
            });
        interact('.ZP > .artifact')
            .gesturable({
                inertia: true,
                restrict: {restriction: "parent", endOnly: true, elementRect: {top: 0, left: 0, bottom: 1, right: 1}},
                autoScroll: true,
                onstart: (function (event) {
                    var $element = $(event.target),
                        offset = $element.offset(),
                        artifact = this._ZP.getArtifact($element.attr('id'));
                    if ($element.hasClass('dropped')) {
                        artifact.x = offset.left;
                        artifact.y = offset.top;
                    }
                    $element.removeClass('active');
                    $('svg [data-artifact=' + artifact.id + ']').remove();
                    $element.css('z-index', Z_INDEX);
                    Z_INDEX++;
                }).bind(this),
                onmove: function (event) {
                    var $element = $(event.target),
                        artifact = this._ZP.getArtifact($element.attr('id'));
                    artifact.x += event.dx;
                    artifact.y += event.dy;
                    artifact.scale += event.ds;
                    artifact.angle += event.da;
                    $element.css('transform', 'translate(' + artifact.x + 'px, ' + artifact.y + 'px) scale('
                        + artifact.scale + ') rotate(' + artifact.angle + 'deg)');

                    $('line[data-from=' + artifact.id + ']').each(function (index, element) {
                        var $element = $(element);
                        element.setAttributeNS(null, 'x1', parseFloat($element.attr('x1')) + event.dx);
                        element.setAttributeNS(null, 'y1', parseFloat($element.attr('y1')) + event.dy);
                    });
                    $('line[data-to=' + artifact.id + ']').each(function (index, element) {
                        var $element = $(element);
                        element.setAttributeNS(null, 'x2', parseFloat($element.attr('x2')) + event.dx);
                        element.setAttributeNS(null, 'y2', parseFloat($element.attr('y2')) + event.dy);
                    });
                }
            })
            .on('tap', (function (event) {
                var $artifact = $(event.currentTarget),
                    artifact = this._ZP.getArtifact($artifact.attr('id'));
                $artifact.css('z-index', Z_INDEX);
                Z_INDEX++;
                if ($artifact.hasClass('active')) {
                    $artifact.removeClass('active');
                    $('svg [data-artifact=' + $artifact.attr('id') + ']').remove();
                } else {
                    var shape = document.createElementNS('http://www.w3.org/2000/svg', 'line'),
                        ZE = this._ZP.getZE(artifact.ZE);
                    if (ZE) {
                        var $ZE = $('#' + ZE.id);
                        $artifact.addClass('active');
                        shape.setAttributeNS(null, 'data-ze', ZE.id);
                        shape.setAttributeNS(null, 'data-artifact', artifact.id);
                        switch (ZE.angle) {
                            case ANGLE_TOP:
                            case ANGLE_BOTTOM:
                                shape.setAttributeNS(null, "x1", $ZE.offset().left + $ZE.width() / 2);
                                shape.setAttributeNS(null, "y1", $ZE.offset().top + $ZE.height() / 2);
                                break;
                            case ANGLE_LEFT:
                            case ANGLE_RIGHT:
                                shape.setAttributeNS(null, "x1", $ZE.offset().left + $ZE.height() / 2);
                                shape.setAttributeNS(null, "y1", $ZE.offset().top + $ZE.width() / 2);
                        }
                        shape.setAttributeNS(null, "x2", artifact.x + $artifact.width() / 2);
                        shape.setAttributeNS(null, "y2", artifact.y + $artifact.height() / 2);
                        shape.setAttributeNS(null, "stroke", "black");
                        shape.setAttributeNS(null, "stroke-width", 3);
                        document.getElementsByTagName('svg')[0].appendChild(shape);
                    }
                }
            }).bind(this));
    }
}