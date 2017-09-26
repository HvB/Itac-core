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
        }];
    }
}