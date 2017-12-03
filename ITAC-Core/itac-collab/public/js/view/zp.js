/* ==========================================
 *  les zones de partage
 * ==========================================
 */
class ZPView extends View {
    constructor(ZP, connection) {
        super(ZP, connection);
        new MenuView(ZP, connection);
        new ZEView(ZP, connection);
        new ArtifactView(ZP, connection);
        new LineView(ZP, connection);
    }

    _dropzone() {
        return [{
            target: '.ZP',
            option: {
                accept: '.artifact.message, .artifact.image',
                overlap: 0.5,

                ondropactivate: function (event) {
                    $(event.target).addClass('drop-active');
                },

                ondragenter: function (event) {
                    // $(event.target).addClass('drop-target');
                    $(event.relatedTarget).addClass('can-drop');
                },

                ondragleave: function (event) {
                    // $(event.target).removeClass('drop-target');
                    $(event.relatedTarget).removeClass('can-drop');
                    // $(event.relatedTarget).addClass('artifact');
                },

                ondrop: function (event) {
                    $(event.relatedTarget).removeClass('can-drop');
                    // $(event.relatedTarget).addClass('artifact');
                },

                ondropdeactivate: function (event) {
                    $(event.target).removeClass('drop-active drop-target');
                }
            }
        }];
    }
}