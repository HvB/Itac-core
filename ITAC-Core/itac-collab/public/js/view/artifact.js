/*
 *     Copyright © 2016-2018 AIP Primeca RAO
 *     Copyright © 2016-2018 Université Savoie Mont Blanc
 *     Copyright © 2017 David Wayntal
 *
 *     This file is part of ITAC-Core.
 *
 *     ITAC-Core is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
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
                    //ToDo: verifier si on peut supprimer cette partie
                    // var artifactId = $(event.relatedTarget).attr('data-from');
                    // if ($('#' + artifactId).is('.message', '.image')) {
                    // var artifact = this._ZP.getArtifact(artifactId);
                    // console.log(event.relatedTarget);
                    // $(event.target).not('#' + $(event.relatedTarget).attr('data-from')).addClass('drop-active');
                    // }
                }).bind(this),
                ondragenter: function (event) {
                    //ToDo: verifier si on peut supprimer cette partie
                    // console.log($(event.target));
                    // $(event.target).not('#' + $(event.relatedTarget).attr('data-from')).addClass('drop-target');
                },
                ondragleave: function (event) {
                    //ToDo: verifier si on peut supprimer cette partie
                    // $(event.target).removeClass('drop-target');
                },
                ondrop: (function (event) {
                    var $target = $(event.target),
                        shape = event.relatedTarget,
                        $shape = $(shape),
                        artifactFrom = this._ZP.getArtifact($shape.attr('data-from')),
                        artifactTo = this._ZP.getArtifact($target.attr('id'));
                    console.log("source "+$shape.attr('data-from')+" drop "+$(event.target).attr('id'));
                    if (artifactFrom && artifactTo && artifactFrom != artifactTo && ! (artifactFrom.hasLinkTo(artifactTo.id))) {
                        //ToDo: verifier si on peut supprimer cette partie
                        //ToDo: normalement ce code devrait avoir ete déplace dans l'observer des artefacts...
                        // a priori la fixation de x1/y1/x2/y2 est inutile -- elle est faite dans la mise a jour de l'artefact
                        shape.setAttributeNS(null, 'x2', artifactTo.getX('px') );
                        shape.setAttributeNS(null, 'y2', artifactTo.getY('px') );
                        shape.setAttributeNS(null, 'data-to', artifactTo.id);
                        $shape.attr('data-to', artifactTo.id);
                        $shape.removeClass('temporary');
                        artifactFrom.addLinkTo(artifactTo.id);
                    } else {
                        $shape.remove();
                    }
                }).bind(this),
                ondropdeactivate: function (event) {
                    //ToDo: verifier si on peut supprimer cette partie
                    // var artifactId = $(event.relatedTarget).attr('data-to');
                    // var $shape = $(event.relatedTarget);
                    // $(event.target).removeClass('drop-active drop-target');
                    // if ($shape.hasClass('temporary')) {
                    //     $shape.remove();
                    // }
                }
            }
        }, {
            //ToDo: verifier si on peut supprimer cette partie
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

    //ToDo: supprimer cette fonction ?
    _startArtifact(event) {
        let $element = $(event.target);
        let artifact = this._ZP.getArtifact($element.attr('id'));
        if ($element.hasClass('dropped')) {
            let x = event.clientX;
            let y = event.clientY;
            artifact.setXY(x,y);
        }
        artifact.startMove();
        // $element.removeClass('active');
        // $('svg [data-artifact=' + artifact.id + ']').remove();
        // $element.appendTo(".ZP");
        // $element.css('transform', 'translate(' + artifact.getX('px') +', '+ artifact.getY('px') + ') scale('
        //     + artifact.scale + ') rotate(' + artifact.getAngle('deg') + ')');
        // $element.css('z-index', Z_INDEX);
        // Z_INDEX++;
    }

    _draggable() {
        return [{
            target: '.ZP > .artifact.message, .ZP > .artifact.image',
            option: {
                inertia: true,
                restrict: {restriction: 'parent', endOnly: true, elementRect: {top: 0.5, left: 0.5, bottom: 0.5, right: 0.5}},
                //restrict: {restriction: 'parent', endOnly: true},
                autoScroll: true,
                onstart: (function (event) {
                    this._startArtifact(event);
                }).bind(this),
                onmove: (function (event) {
                    let $element = $(event.target);
                    let artifact = this._ZP.getArtifact($element.attr('id'));
                    artifact.move(event.dx, event.dy);
                }).bind(this),
                onend: (function (event) {
                    let id = $(event.target).attr('id');
                    let artifact = this._ZP.getArtifact(id);
                    artifact.endMove();
                }).bind(this)
            }
        }, {
            target: '.ZE .artifact.message, .ZE .artifact.image',
            option: {
                inertia: true,
                restrict: {restriction: 'parent', endOnly: true, elementRect: {top: 0, left: 0, bottom: 1, right: 1}},
                autoScroll: true,
                onstart: (function (event) {
                    this._startArtifact(event);
                }).bind(this),
                onmove: (function (event) {
                    let $element = $(event.target);
                    let artifact = this._ZP.getArtifact($element.attr('id'));
                    artifact.move(event.dx, event.dy);
                }).bind(this),
                onend: (function (event) {
                    let id = $(event.target).attr('id');
                    let artifact = this._ZP.getArtifact(id);
                    artifact.endMove();
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
                            //ToDo: verifier si il faut supprimer ce code
                            // tool.point.ZE = idZE;
                            // this._ZP.getArtifact(this._ZP.background).addPoint(tool.point.id, tool.point.toJSON());
                            let point = tool.point;
                            this._ZP.getArtifact(this._ZP.background).addPoint(point);
                            this._ZP.addArtifact(point);
                            this._startArtifact(event);
                            point.visible = true;
                            tool.reset();
                            let observer1 = this._connection.pointObserver;
                            let observer2 = this._connection.jsonPatchArtifactObserver;
                            point.addObserver(observer1);
                            point.addObserver(observer2);
                            // setTimeout(()=>{point.addObserver(observer1);});
                            // setTimeout(()=>{point.addObserver(observer2);});
                        }
                        this._startArtifact(event);
                    }
                }).bind(this),
                onmove: (function (event) {
                    if (this._ZP.background) {
                        let $element = $(event.target);
                        let point = this._ZP.getArtifact(this._ZP.background).getPoint($element.attr('id'));
                        // let point = this._ZP.getArtifact($element.attr('id'));
                        if (point) point.move(event.dx, event.dy);
                    }
                }).bind(this),
                onend: (function (event) {
                    if (this._ZP.background) {
                        let id = $(event.target).attr('id');
                        let point = this._ZP.getArtifact(this._ZP.background).getPoint(id);
                        // let point = this._ZP.getArtifact(id);
                        if (point) {
                            point.endMove();
                            let $point = $('.template > .artifact.point').clone(),
                                idZE = point.ZE, tool;
                            if (this._ZP.getZE(idZE)) tool = this._ZP.getZE(idZE).tool;
                            if (tool && !tool.point) {
                                tool.reload();
                                $('.ZE#' + idZE + ' .tool').append($point.addClass('dropped unpinned').removeClass('pinned'));
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
                inertia: false,
                restrict: {restriction: 'parent', endOnly: true, elementRect: {top: 0.5, left: 0.5, bottom: 0.5, right: 0.5}},
                autoScroll: true,
                onstart: (function (event) {
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
                }).bind(this)
            }
        }];
    }

    _tap() {
        return [
            // suppression affichage de l'historique
            /*
            {
            //ToDo: verifier si on doit supprimer cette partie (cf. reunion du 29/11/2017)
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
                            shape.setAttributeNS(null, 'x2', artifact.getX('px') );
                            shape.setAttributeNS(null, 'y2', artifact.getY('px') );
                            shape.setAttributeNS(null, 'stroke', 'black');
                            shape.setAttributeNS(null, 'stroke-width', 3);
                            $('svg').append(shape);
                        }
                    }
                }
            }).bind(this)
        },
        */
            {
            target: '.ZP > .artifact.point',
            action: (function (event) {
                let $artifact = $(event.currentTarget);
                $artifact.toggleClass("pinned unpinned");
            }).bind(this),
        }];
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