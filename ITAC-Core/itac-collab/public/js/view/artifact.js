// interact('.dropped').gesturable({ //les artefact dans la ZE ne peuvent pas etre manipuler (zoom, rotation)
//     enabled: true
// });
class ArtifactView extends View {
    constructor(ZP, connection) {
        super(ZP, connection);
        this._pointObserver = new PointObserver(ZP, connection);
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
                    var $target = $(event.target),
                        shape = event.relatedTarget,
                        $shape = $(shape),
                        artifactFrom = this._ZP.getArtifact($shape.attr('data-from')),
                        artifactTo = this._ZP.getArtifact($target.attr('id'));
                    console.log("source "+$shape.attr('data-from')+" drop "+$(event.target).attr('id'));
                    if (!artifactFrom || artifactFrom.hasLinkTo(artifactTo.id)) {
                        $shape.remove();
                    } else if (artifactFrom && artifactTo && artifactFrom != artifactTo ) {
                        // shape.setAttributeNS(null, 'x2', artifactTo.x + $target.width() / 2);
                        // shape.setAttributeNS(null, 'y2', artifactTo.y + $target.height() / 2);
                        // a priori la fixation de x1/y1/x2/y2 est inutile -- elle est faite dans la mise a jour de l'artefact
                        shape.setAttributeNS(null, 'x2', artifactTo.getX('px') );
                        shape.setAttributeNS(null, 'y2', artifactTo.getY('px') );
                        shape.setAttributeNS(null, 'data-to', artifactTo.id);
                        $shape.attr('data-to', artifactTo.id);
                        $shape.removeClass('temporary');
                        let emptyLinksTo = artifactFrom.linksTo;
                        artifactFrom.addLinkTo(artifactTo.id);
                        // let imageId = this._ZP.background;
                        let jsonPatchTargetId = artifactFrom.id;
                        let jsonPatchPath;
                        let jsonPatchValue;
                        if (emptyLinksTo) {
                            jsonPatchPath = '/linksTo/' + artifactTo.id;
                            jsonPatchValue = artifactTo.id;
                        } else {
                            jsonPatchPath = '/linksTo';
                            jsonPatchValue = artifactFrom.linksTo;
                        }
                        if (artifactFrom.parent) {
                            jsonPatchTargetId = artifactFrom.parent.id;
                            jsonPatchPath = '/points/' + artifactFrom.id + jsonPatchPath;
                        }
                        if (artifactFrom && artifactTo && jsonPatchTargetId) {
                            this._connection.emitArtifactPartialUpdate(jsonPatchTargetId, [{
                                op: 'add',
                                path: jsonPatchPath,
                                value: jsonPatchValue
                            }]);
                        }
                    }
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
                    // var artifactId = $(event.relatedTarget).attr('data-from');
                    // if ($('#' + artifactId).is('.point')) {
                    //     console.log(event.relatedTarget);
                    //     $(event.target).not('#' + $(event.relatedTarget).attr('data-from')).addClass('drop-active');
                    //     // var point = this._ZP.getArtifact(this._ZP.background).getPoint(event.target.id);
                    //     // console.log(point)
                    // }
                }).bind(this),
                ondragenter: function (event) {
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
                    //     artifactTo = this._ZP.getArtifact(this._ZP.background).getPoint($target.attr('id'));
                    // if (artifactFrom) {
                    //     if (artifactTo.hasLinkTo(artifactFrom.id)) {
                    //         $('line[data-from=' + artifactFrom.id + '].temporary').remove();
                    //     } else {
                    //         shape.setAttributeNS(null, 'x2', artifactTo.x + $target.width() / 2);
                    //         shape.setAttributeNS(null, 'y2', artifactTo.y + $target.height() / 2);
                    //         $shape.attr('data-to', artifactTo.id);
                    //         $shape.removeClass('temporary');
                    //         artifactTo.addLinkTo(artifactFrom.id);
                    //     }
                    // }
                }).bind(this),
                // ondropdeactivate: function (event) {
                //     console.log('point')
                // }
            }
        }];
    }

    _startArtifact(event) {
        let $element = $(event.target);
        let artifact = this._ZP.getArtifact($element.attr('id'));
        if ($element.hasClass('dropped')) {
            let x = event.clientX0;
            let y = event.clientY0;
            artifact.setXY(x,y);
        }
        artifact.startMove();
        $element.removeClass('active');
        $('svg [data-artifact=' + artifact.id + ']').remove();
        $element.css('z-index', Z_INDEX);
        Z_INDEX++;
    }

    // ToDo: remove obsolete code
    // _startArtifact($element, artifact, event) {
    //     if ($element.hasClass('dropped')) {
    //         var offset = $element.offset();
    //         // let x = offset.left - $element.width()/2;
    //         // let y = offset.top - $element.height()/2;
    //         let x = offset.left;
    //         let y = offset.top;
    //         if (event){
    //             x = event.clientX0;
    //             y = event.clientY0;
    //         }
    //         artifact.setXY(x,y);
    //     }
    //     artifact.startMove();
    //     $element.removeClass('active');
    //     $('svg [data-artifact=' + artifact.id + ']').remove();
    //     $element.css('z-index', Z_INDEX);
    //     Z_INDEX++;
    // }

    // ToDo: remove obsolete code
    // _moveArtifact(event, $element, artifact) {
    //     artifact.x += event.dx;
    //     artifact.y += event.dy;
    //     artifact.notifyObservers("move");
    //     $element.css('transform', 'translate(' + artifact.x + 'px, ' + artifact.y + 'px) scale('
    //         + artifact.scale + ') rotate(' + artifact.angle + 'deg)');
    //     $('line[data-from=' + artifact.id + ']').each(function (index, element) {
    //         var $element = $(element);
    //         element.setAttributeNS(null, 'x1', parseFloat($element.attr('x1')) + event.dx);
    //         element.setAttributeNS(null, 'y1', parseFloat($element.attr('y1')) + event.dy);
    //     });
    //     $('line[data-to=' + artifact.id + ']').each(function (index, element) {
    //         var $element = $(element);
    //         element.setAttributeNS(null, 'x2', parseFloat($element.attr('x2')) + event.dx);
    //         element.setAttributeNS(null, 'y2', parseFloat($element.attr('y2')) + event.dy);
    //     });
    // }

    _draggable() {
        return [{
            target: '.ZP > .artifact.message, .ZP > .artifact.image',
            option: {
                inertia: true,
                restrict: {restriction: 'parent', endOnly: true, elementRect: {top: 0, left: 0, bottom: 1, right: 1}},
                autoScroll: true,
                onstart: (function (event) {
                    // ToDo: remove obsolete code
                    // var $element = $(event.target);
                    // this._startArtifact($element, this._ZP.getArtifact($element.attr('id')), event);
                    this._startArtifact(event);
                }).bind(this),
                onmove: (function (event) {
                    let $element = $(event.target);
                    let artifact = this._ZP.getArtifact($element.attr('id'));
                    artifact.move(event.dx, event.dy);
                    // ToDo: remove obsolete code
                    //this._moveArtifact(event, $element, this._ZP.getArtifact($element.attr('id')));
                }).bind(this),
                onend: (function (event) {
                    let id = $(event.target).attr('id');
                    let artifact = this._ZP.getArtifact(id);
                    artifact.endMove();
                    if (artifact) {
                        this._connection.emitArtifactPartialUpdate(id, [{
                            op: 'add',
                            path: '/position',
                            value: artifact.jsonPosition
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
                    // ToDo: remove obsolete code
                    // var $element = $(event.target);
                    // this._startArtifact($element, this._ZP.getArtifact($element.attr('id')), event);
                    this._startArtifact(event);
                }).bind(this),
                onmove: (function (event) {
                    let $element = $(event.target);
                    let artifact = this._ZP.getArtifact($element.attr('id'));
                    artifact.move(event.dx, event.dy);
                    // ToDo: remove obsolete code
                    // this._moveArtifact(event, $element, this._ZP.getArtifact($element.attr('id')));
                }).bind(this),
                onend: (function (event) {
                    let id = $(event.target).attr('id');
                    this._connection.emitArtifactPartialUpdate(id, [{
                        op: 'add',
                        path: '/position',
                        value: this._ZP.getArtifact(id).toJSON()['position']
                    }]);
                }).bind(this)
            }
        }, {
            target: '.artifact.point.unpinned',
            option: {
                inertia: false,
                restrict: {restriction: 'parent', endOnly: true, elementRect: {top: 0, left: 0, bottom: 1, right: 1}},
                autoScroll: true,
                onstart: (function (event) {
                    if (this._ZP.background) {
                        let $element = $(event.target);
                        if ($element.hasClass('dropped')) {
                            let idZE = $element.parents('.ZE').attr('id');
                            let tool = this._ZP.getZE(idZE).tool;
                            // tool.point.ZE = idZE;
                            // this._ZP.getArtifact(this._ZP.background).addPoint(tool.point.id, tool.point.toJSON());
                            let point = tool.point;
                            this._ZP.getArtifact(this._ZP.background).addPoint(point);
                            this._ZP.addArtifact(point);
                            //let point = this._ZP.getArtifact(this._ZP.background).getPoint(tool.point.id);
                            point.visible = true;
                            tool.reset();
                            let observer = this._pointObserver;
                            setTimeout(()=>{point.addObserver(observer);});
                        }
                        // ToDo: remove obsolete code
                        //this._startArtifact($element, this._ZP.getArtifact(this._ZP.background).getPoint($element.attr('id')), event);
                        this._startArtifact(event);
                    }
                }).bind(this),
                onmove: (function (event) {
                    if (this._ZP.background) {
                        let $element = $(event.target);
                        let point = this._ZP.getArtifact(this._ZP.background).getPoint($element.attr('id'));
                        // let point = this._ZP.getArtifact($element.attr('id'));
                        if (point) point.move(event.dx, event.dy);
                        // ToDo: remove obsolete code
                        // this._moveArtifact(event, $element, this._ZP.getArtifact(this._ZP.background).getPoint($element.attr('id')));
                    }
                }).bind(this),
                onend: (function (event) {
                    if (this._ZP.background) {
                        let id = $(event.target).attr('id');
                        let point = this._ZP.getArtifact(this._ZP.background).getPoint(id);
                        // let point = this._ZP.getArtifact(id);
                        point.endMove();
                        if (point) {
                            this._connection.emitArtifactPartialUpdate(this._ZP.background, [{
                                op: 'add',
                                path: '/points/' + id,
                                value: point.toJSON()
                            }]);
                            let $point = $('.template > .artifact.point').clone(),
                                idZE = point.ZE, tool;
                            if (this._ZP.getZE(idZE)) tool = this._ZP.getZE(idZE).tool;
                            if (tool && !tool.point) {
                                tool.reload();
                                $('.ZE#' + idZE + ' .tool').append($point.addClass('dropped'));
                                $point.attr('id', tool.point.id);
                            }
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
                    // ToDo: remove obsolete code
                    // var $element = $(event.target);
                    // this._startArtifact($element, this._ZP.getArtifact($element.attr('id')), event);
                    this._startArtifact(event);
                }).bind(this),
                onmove: (function (event) {
                    let $element = $(event.target);
                    let artifact = this._ZP.getArtifact($element.attr('id'));
                    artifact.move(event.dx, event.dy, event.ds, event.da);
                }).bind(this),
                onend: (function (event) {
                    let id = $(event.target).attr('id');
                    let artifact = this._ZP.getArtifact(id);
                    artifact.endMove();
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
                let $artifact = $(event.currentTarget);
                let artifact = this._ZP.getArtifact($artifact.attr('id'));
                if (artifact) {
                    $artifact.css('z-index', Z_INDEX);
                    Z_INDEX++;
                    if ($artifact.hasClass('active')) {
                        $artifact.removeClass('active');
                        $('svg [data-artifact=' + $artifact.attr('id') + ']').remove();
                    } else {
                        $artifact.addClass('active');
                        var shape = document.createElementNS('http://www.w3.org/2000/svg', 'line'),
                            ZE = this._ZP.getZE(artifact.ZE);
                        if (ZE) {
                            var $ZE = $('#' + ZE.id);
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
                            // shape.setAttributeNS(null, 'x2', artifact.x + $artifact.width() / 2);
                            // shape.setAttributeNS(null, 'y2', artifact.y + $artifact.height() / 2);
                            shape.setAttributeNS(null, 'x2', artifact.getX('px') );
                            shape.setAttributeNS(null, 'y2', artifact.getY('px') );
                            shape.setAttributeNS(null, 'stroke', 'black');
                            shape.setAttributeNS(null, 'stroke-width', 3);
                            $('svg').append(shape);
                        }
                    }
                }
            }).bind(this)
        }, {
            target: '.ZP > .artifact.point',
            action: (function (event) {
                let $artifact = $(event.currentTarget);
                $artifact.toggleClass("pinned unpinned");
            }).bind(this),
        }];
    }

    // _createLine(event, $element, artifact) {
    //     var interaction = event.interaction,
    //         line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    //     line.setAttributeNS(null, 'class', 'temporary');
    //     line.setAttributeNS(null, 'data-from', artifact.id);
    //     line.setAttributeNS(null, 'x1', artifact.x + $element.width() / 2);
    //     line.setAttributeNS(null, 'y1', artifact.y + $element.height() / 2);
    //     line.setAttributeNS(null, 'x2', event.clientX);
    //     line.setAttributeNS(null, 'y2', event.clientY);
    //     line.setAttributeNS(null, 'stroke', 'black');
    //     line.setAttributeNS(null, 'stroke-width', 3);
    //     $('svg').append(line);
    //     if (!interaction.interacting()) {
    //         interaction.start({name: 'drag'}, interact('line'), line);
    //     }
    // }

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
                let id1 = $element.attr('id');
                let artifact = this._ZP.getArtifact(id1);
                // let x1 = $element.offset().left + $element.width()/2;
                // let y1 = $element.offset().top + $element.height()/2;
                let x1 = artifact.getX('px');
                let y1 = artifact.getY('px');
                let id2 = null;
                let x2 = x1;
                let y2 = y1;
                //ToDO:remove obsolete code
                // this._createLine(event, $element, this._ZP.getArtifact(this._ZP.background).getPoint($element.attr('id')));
                let interaction = event.interaction;
                let line = View.createLine(true, id1, x1, y1, id2, x2, y2);
                if (!interaction.interacting()) {
                    interaction.start({name: 'drag'}, interact('line'), line);
                }
            }).bind(this)
        }];
    }

    _down() {
        return [{
            target: '.ZP > .artifact.point.pinned',
            action: (function (event) {
                console.log("down");
                var $element = $(event.target);
                let id1 = $element.attr('id');
                let artifact = this._ZP.getArtifact(id1);
                let x1 = artifact.getX('px');
                let y1 = artifact.getY('px');
                let id2 = null;
                let x2 = x1;
                let y2 = y1;
                let interaction = event.interaction;
                let line = View.createLine(true, id1, x1, y1, id2, x2, y2);
                if (!interaction.interacting()) {
                    interaction.start({name: 'drag'}, interact('line'), line);
                }
            }).bind(this)
        },{
            target: '.ZP > .artifact > .artifact.point.pinned',
            action: (function (event) {
                console.log("down");
                var $element = $(event.target).parent();
                let id1 = $element.attr('id');
                let artifact = this._ZP.getArtifact(id1);
                let x1 = artifact.getX('px');
                let y1 = artifact.getY('px');
                let id2 = null;
                let x2 = x1;
                let y2 = y1;
                let interaction = event.interaction;
                let line = View.createLine(true, id1, x1, y1, id2, x2, y2, "link");
                if (!interaction.interacting()) {
                    interaction.start({name: 'drag'}, interact('line'), line);
                }
            }).bind(this)
        }];
    }
}