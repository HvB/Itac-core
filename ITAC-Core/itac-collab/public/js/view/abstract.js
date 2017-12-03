class View {
    constructor(ZP, connection) {
        this._ZP = ZP;
        this._connection = connection;
        for (var i = 0; i < this._dropzone().length; i++) {
            interact(this._dropzone()[i].target).dropzone(this._dropzone()[i].option);
        }
        for (var i = 0; i < this._draggable().length; i++) {
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
        for (var i = 0; i < this._down().length; i++) {
            interact(this._down()[i].target).on('down', this._down()[i].action);
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

    _down() {
        return [];
    }

    static createLine(temporary, id1, x1, y1, id2, x2, y2, type="annotation") {
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        if (id1) line.setAttributeNS(null, 'data-from', id1);
        line.setAttributeNS(null, 'x1', x1);
        line.setAttributeNS(null, 'y1', y1);
        if (id2) line.setAttributeNS(null, 'data-to', id2);
        line.setAttributeNS(null, 'x2', x2);
        line.setAttributeNS(null, 'y2', y2);
        line.setAttributeNS(null, 'stroke', 'black');
        line.setAttributeNS(null, 'stroke-width', 3);
        if (type) {
            line.setAttributeNS(null, 'class', (type ? type : ''));
        }
        if (temporary) {
            line.setAttributeNS(null, 'class', 'temporary ' + (type ? type : ''));
        } else {
            line.setAttributeNS(null, 'style', 'display:none;');
        }
        $('svg').append(line);
        return line;
    }
}