// interact('.dropped').gesturable({ //les artefact dans la ZE ne peuvent pas etre manipuler (zoom, rotation)
//     enabled: true
// });
class ArtifactView extends View {
    constructor(ZP, connection) {
        super(ZP, connection);
    }

    _dropzone() {
        return [{
            target: '.ZP > .artifact.message, .ZP > .artifact.image',
            option: {
                accept: 'line',
                ondropactivate: (function (event) {
                    // var artifactId = $(event.relatedTarget).attr('data-from');
                    // if ($('#' + artifactId).is('.message', '.image')) {
                        // var artifact = this._ZP.getArtifact(artifactId);
                        // console.log(event.relatedTarget);
                        // $(event.target).not('#' + $(event.relatedTarget).attr('data-from')).addClass('drop-active');
                    // }
                }).bind(this),
                ondragenter: function (event) {
                    // console.log($(event.target));
                    // $(event.target).not('#' + $(event.relatedTarget).attr('data-from')).addClass('drop-target');
                },
                ondragleave: function (event) {
                    // $(event.target).removeClass('drop-target');
                },
                ondrop: (function (event) {
                    // var $target = $(event.target),
                    //     shape = event.relatedTarget,
                    //     $shape = $(shape),
                    //     artifactFrom = this._ZP.getArtifact($shape.attr('data-from')),
                    //     artifactTo = this._ZP.getArtifact($target.attr('id'));
                    // if (!artifactFrom) {
                    //     artifactFrom = this._ZP.getArtifact(this._ZP.background).getPoint($shape.attr('data-from'));
                    //     if (artifactFrom.hasLinkTo(artifactTo.id)) {
                    //         $('line[data-from=' + artifactFrom.id + '].temporary').remove();
                    //     } else {
                    //         shape.setAttributeNS(null, 'x2', artifactTo.x + $target.width() / 2);
                    //         shape.setAttributeNS(null, 'y2', artifactTo.y + $target.height() / 2);
                    //         $shape.attr('data-to', artifactTo.id);
                    //         $shape.removeClass('temporary');
                    //         artifactFrom.addLinkTo(artifactTo.id);
                    //     }
                    // }
                }).bind(this),
                ondropdeactivate: function (event) {
                    // var artifactId = $(event.relatedTarget).attr('data-to');
                    // var $shape = $(event.relatedTarget);
                    // $(event.target).removeClass('drop-active drop-target');
                    // if ($shape.hasClass('temporary')) {
                    //     $shape.remove();
                    // }
                }
            }
        }, {
            target: '.ZP > .artifact.point',
            option: {
                accept: 'line',
                ondropactivate: (function (event) {
                    var artifactId = $(event.relatedTarget).attr('data-from');
                    if ($('#' + artifactId).is('.point')) {
                        console.log(event.relatedTarget);
                        $(event.target).not('#' + $(event.relatedTarget).attr('data-from')).addClass('drop-active');
                        var point = this._ZP.getArtifact(this._ZP.background).getPoint(event.target.id);
                        console.log(point)
                    }
                }).bind(this),
                ondragenter: function (event) {
                    $(event.target).not('#' + $(event.relatedTarget).attr('data-from')).addClass('drop-target');
                },
                ondragleave: function (event) {
                    $(event.target).removeClass('drop-target');
                },
                ondrop: (function (event) {
                    var $target = $(event.target),
                        shape = event.relatedTarget,
                        $shape = $(shape),
                        artifactFrom = this._ZP.getArtifact($shape.attr('data-from')),
                        artifactTo = this._ZP.getArtifact(this._ZP.background).getPoint($target.attr('id'));
                    if (artifactFrom) {
                        if (artifactTo.hasLinkTo(artifactFrom.id)) {
                            $('line[data-from=' + artifactFrom.id + '].temporary').remove();
                        } else {
                            shape.setAttributeNS(null, 'x2', artifactTo.x + $target.width() / 2);
                            shape.setAttributeNS(null, 'y2', artifactTo.y + $target.height() / 2);
                            $shape.attr('data-to', artifactTo.id);
                            $shape.removeClass('temporary');
                            artifactTo.addLinkTo(artifactFrom.id);
                        }
                    }
                }).bind(this),
                // ondropdeactivate: function (event) {
                //     console.log('point')
                // }
            }
        }];
    }

    _startArtifact($element, artifact) {
        if ($element.hasClass('dropped')) {
            var offset = $element.offset();
            artifact.x = offset.left;
            artifact.y = offset.top;
        }
        $element.removeClass('active');
        $('svg [data-artifact=' + artifact.id + ']').remove();
        $element.css('z-index', Z_INDEX);
        Z_INDEX++;
    }

    _moveArtifact(event, $element, artifact) {
        artifact.x += event.dx;
        artifact.y += event.dy;
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

    _draggable() {
        return [{
            target: '.ZP > .artifact.message, .ZP > .artifact.image',
            option: {
                inertia: true,
                restrict: {restriction: 'parent', endOnly: true, elementRect: {top: 0, left: 0, bottom: 1, right: 1}},
                autoScroll: true,
                onstart: (function (event) {
                    var $element = $(event.target);
                    this._startArtifact($element, this._ZP.getArtifact($element.attr('id')));
                }).bind(this),
                onmove: (function (event) {
                    var $element = $(event.target);
                    this._moveArtifact(event, $element, this._ZP.getArtifact($element.attr('id')));
                }).bind(this),
                onend: (function (event) {
                    var id = $(event.target).attr('id'),
                        artifact = this._ZP.getArtifact(id);
                    if (artifact) {
                        this._connection.emitArtifactPartialUpdate(id, [{
                            op: 'add',
                            path: '/position',
                            value: artifact.toJSON()['position']
                        }]);
                    }
                }).bind(this)
            }
        }, {
            target: '.ZE .artifact.message, .ZE .artifact.image',
            option: {
                inertia: true,
                restrict: {restriction: 'parent', endOnly: true, elementRect: {top: 0, left: 0, bottom: 1, right: 1}},
                autoScroll: true,
                onstart: (function (event) {
                    var $element = $(event.target);
                    this._startArtifact($element, this._ZP.getArtifact($element.attr('id')));
                }).bind(this),
                onmove: (function (event) {
                    var $element = $(event.target);
                    this._moveArtifact(event, $element, this._ZP.getArtifact($element.attr('id')));
                }).bind(this),
                onend: (function (event) {
                    var id = $(event.target).attr('id');
                    this._connection.emitArtifactPartialUpdate(id, [{
                        op: 'add',
                        path: '/position',
                        value: this._ZP.getArtifact(id).toJSON()['position']
                    }]);
                }).bind(this)
            }
        }, {
            target: '.artifact.point',
            option: {
                inertia: true,
                restrict: {restriction: 'parent', endOnly: true, elementRect: {top: 0, left: 0, bottom: 1, right: 1}},
                autoScroll: true,
                onstart: (function (event) {
                    if (this._ZP.background) {
                        var $element = $(event.target);
                        if ($element.hasClass('dropped')) {
                            var idZE = $element.parents('.ZE').attr('id'),
                                tool = this._ZP.getZE(idZE).tool;
                            tool.point.ZE = idZE;
                            this._ZP.getArtifact(this._ZP.background).addPoint(tool.point.id, tool.point.toJSON());
                            tool.reset();
                        }
                        this._startArtifact($element, this._ZP.getArtifact(this._ZP.background).getPoint($element.attr('id')));
                    }
                }).bind(this),
                onmove: (function (event) {
                    if (this._ZP.background) {
                        var $element = $(event.target);
                        this._moveArtifact(event, $element, this._ZP.getArtifact(this._ZP.background).getPoint($element.attr('id')));
                    }
                }).bind(this),
                onend: (function (event) {
                    if (this._ZP.background) {
                        var id = $(event.target).attr('id'),
                            point = this._ZP.getArtifact(this._ZP.background).getPoint(id);
                        if (point) {
                            this._connection.emitArtifactPartialUpdate(this._ZP.background, [{
                                op: 'add',
                                path: '/points/' + id,
                                value: point.toJSON()
                            }]);
                        }
                    }
                }).bind(this)
            }
        }];
    }

    _gesturable() {
        return [{
            target: '.ZP > .artifact.message, .ZP > .artifact.image',
            option: {
                inertia: true,
                restrict: {restriction: 'parent', endOnly: true, elementRect: {top: 0, left: 0, bottom: 1, right: 1}},
                autoScroll: true,
                onstart: (function (event) {
                    var $element = $(event.target);
                    this._startArtifact($element, this._ZP.getArtifact($element.attr('id')));
                }).bind(this),
                onmove: (function (event) {
                    var $element = $(event.target),
                        artifact = this._ZP.getArtifact($element.attr('id'));
                    artifact.scale += event.ds;
                    artifact.angle += event.da;
                    this._moveArtifact(event, $element, artifact);
                }).bind(this),
                onend: (function (event) {
                    var id = $(event.target).attr('id'),
                        artifact = this._ZP.getArtifact(id);
                    if (artifact) {
                        this._connection.emitArtifactPartialUpdate(id, [{
                            op: 'add',
                            path: '/position',
                            value: artifact.toJSON()['position']
                        }]);
                    }
                }).bind(this)
            }
        }];
    }

    _tap() {
        return [{
            target: '.ZP > .artifact.message, .ZP > .artifact.image',
            action: (function (event) {
                var $artifact = $(event.currentTarget),
                    artifact = this._ZP.getArtifact($artifact.attr('id'));
                if (artifact) {
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
                                    shape.setAttributeNS(null, 'x1', $ZE.offset().left + $ZE.width() / 2);
                                    shape.setAttributeNS(null, 'y1', $ZE.offset().top + $ZE.height() / 2);
                                    break;
                                case ANGLE_LEFT:
                                case ANGLE_RIGHT:
                                    shape.setAttributeNS(null, 'x1', $ZE.offset().left + $ZE.height() / 2);
                                    shape.setAttributeNS(null, 'y1', $ZE.offset().top + $ZE.width() / 2);
                            }
                            shape.setAttributeNS(null, 'x2', artifact.x + $artifact.width() / 2);
                            shape.setAttributeNS(null, 'y2', artifact.y + $artifact.height() / 2);
                            shape.setAttributeNS(null, 'stroke', 'black');
                            shape.setAttributeNS(null, 'stroke-width', 3);
                            $('svg').append(shape);
                        }
                    }
                }
            }).bind(this)
        }];
    }

    _createLine(event, $element, artifact) {
        var interaction = event.interaction,
            line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttributeNS(null, 'class', 'temporary');
        line.setAttributeNS(null, 'data-from', artifact.id);
        line.setAttributeNS(null, 'x1', artifact.x + $element.width() / 2);
        line.setAttributeNS(null, 'y1', artifact.y + $element.height() / 2);
        line.setAttributeNS(null, 'x2', event.clientX);
        line.setAttributeNS(null, 'y2', event.clientY);
        line.setAttributeNS(null, 'stroke', 'black');
        line.setAttributeNS(null, 'stroke-width', 3);
        $('svg').append(line);
        if (!interaction.interacting()) {
            interaction.start({name: 'drag'}, interact('line'), line);
        }
    }

    _hold() {
        return [{
            target: '.ZP > .artifact.message, .ZP > .artifact.image',
            action: (function (event) {
                // var $element = $(event.target);
                // this._createLine(event, $element, this._ZP.getArtifact($element.attr('id')));
            }).bind(this)
        }, {
            target: '.ZP > .artifact.point',
            action: (function (event) {
                var $element = $(event.target);
                this._createLine(event, $element, this._ZP.getArtifact(this._ZP.background).getPoint($element.attr('id')));
            }).bind(this)
        }];
    }
}