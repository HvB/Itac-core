/* ==========================================
 *  la palette des zones d'echange
 * ==========================================
 */
class ToolView extends View {
    constructor(ZP, connection) {
        super(ZP, connection);
    }

    _dropzone() {
        return [{
            target: '.tool',
            option: {
                accept: '.artifact.point',
                overlap: 0.1,

                ondragenter: (function (event) {
                    if (this._ZP.background) {
                        var $element = $(event.relatedTarget);
                        $element.removeClass('dropped');
                        $element.remove().appendTo('.ZP');
                    }
                }).bind(this)
            }
        },{
            target: 'line',
            option:{
                accept: '.scissors',
                overlap: 0.1,
                ondragenter: (function (event){
                    $(event.target).addClass('drop-target');
                }).bind(this),
                ondragleave: (function (event){
                    $(event.target).removeClass('drop-target');
                }).bind(this),
                // verification si on est sur la ligne....
                checker: (function (dragEvent,        // related dragmove or dragend
                                   event,             // Touch, Pointer or Mouse Event
                                   dropped,           // bool default checker result
                                   dropzone,          // dropzone Interactable
                                   dropElement,       // dropzone elemnt
                                   draggable,         // draggable Interactable
                                   draggableElement) {// draggable element
                    let x = event.clientX;
                    let y = event.clientY;
                    let myLine = dropElement;

                    let x1 = myLine.x1.animVal.value;
                    let x2 = myLine.x2.animVal.value;
                    let y1 = myLine.y1.animVal.value;
                    let y2 = myLine.y2.animVal.value;
                    let marge = 20;
                    if ( x1 < x2){
                        if ( x + marge < x1 || x - marge > x2 ) {
                            return false;
                        }
                    } else {
                        if ( x - marge > x1 || x + marge < x2 ) {
                            return false;
                        }
                    }
                    if ( y1 < y2){
                        if (  y + marge < y1 || y - marge > y2 ) {
                            return false;
                        }
                    } else {
                        if ( y - marge > y1 || y + marge < y2 ) {
                            return false;
                        }
                    }
                    if ((Math.abs(x1 - x2) > marge/2 ) && (Math.abs(y1 - y2) > marge/2 )) {
                        let ycible = y1 + (x - x1) * (y2 - y1) / (x2 - x1);
                        if (Math.abs(ycible - y) > marge) {
                            //console.log("delta: "+Math.abs(ycible - y) + " dx = "+Math.abs(x1 - x2));
                            return false;
                        }
                    }
                    return true;
                }).bind(this),
                ondrop: (function(event){
                    //$(event.target).remove();
                    let $line = $(event.target)
                    let dest = $line.attr('data-to');
                    let artifactFrom = this._ZP.getArtifact($line.attr('data-from'));
                    artifactFrom.removeLinkTo(dest);
                }).bind(this)
            }
        }];
    }

    _draggable() {
        return[{
            target: '.scissors',
            option: {
                inertia: false,
                restrict: {restriction: 'parent', endOnly: true, elementRect: {top: 0, left: 0, bottom: 1, right: 1}},
                autoScroll: true,
                onstart: (function (event) {
                    let $element = $(event.target);
                    let $ZE = $element.parents('.ZE');
                    if ($ZE.length > 0 ) {
                        let $clone = $element.clone();
                        $clone.insertBefore($element);
                        $element.addClass('active');
                        let id =  $ZE.attr('id');
                        $element.attr('ZE',id);
                        $element.appendTo(".ZP");
                        let x = event.clientX;
                        let y = event.clientY;
                        $element.css('transform', 'translate(' + x+'px, '+ y+'px)');
                        $element.css('z-index', Z_INDEX);
                        Z_INDEX++;
                    }
                }).bind(this),
                onmove: (function (event) {
                    let $element = $(event.target);
                    let x = event.clientX;
                    let y = event.clientY;
                    $element.css('transform', 'translate(' + x+'px, '+ y+'px) rotate(0deg)');
                }).bind(this),
                onend: (function (event) {
                    let $element = $(event.target);
                    $element.remove();
                }).bind(this)
            }
        }];
    }
}