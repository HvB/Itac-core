class View {
    constructor(ZP, connection) {
        this._ZP = ZP;
        this._connection = connection;
        for (var i = 0; i < this._dropzone().length; i++) {
            interact(this._dropzone()[i].target).dropzone(this._dropzone()[i].option);
        }
        for (var i = 0; i < this._draggable().length; i++) {
            console.log(this._draggable()[i])
            interact(this._draggable()[i].target).draggable(this._draggable()[i].option);
        }
        for (var i = 0; i < this._gesturable().length; i++) {
            interact(this._gesturable()[i].target).gesturable(this._gesturable()[i].option);
        }
        for (var i = 0; i < this._tap().length; i++) {
            interact(this._tap()[i].target).on('tap', this._tap()[i].action);
        }
        for (var i = 0; i < this._hold().length; i++) {
            interact(this._hold()[i].target).on('hold', this._hold()[i].action);
        }
    }

    _dropzone() {
        return [];
    }

    _draggable() {
        return [];
    }

    _gesturable() {
        return [];
    }

    _tap() {
        return [];
    }

    _hold() {
        return [];
    }
}