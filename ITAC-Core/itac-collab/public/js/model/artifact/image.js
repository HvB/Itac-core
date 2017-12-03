class Image extends Artifact {
    constructor(id, data) {
        super(id, ARTIFACT_IMAGE, data);
        this._content = data && data.content ? data.content : '';
        // on verifie si c'est une data-url valide avec du png ou du jpeg
        if (data.content.search(/^data:image\/(png|jpeg|\*);base64,/)===-1){
            // on n'a pas le bon prologue, on met un type mime image generique
            // et on supprime egalement les eventuels retours a la ligne danns les donnees base64
            // ToDo : enlever la suppression des passages à la ligne quans les clients auront ete modifies et testes
            this._content = 'data:image/*;base64,' + this._content.replace(/\s/g,'' );
        }
        this._points = {};
        if (data && data.points) {
            for (var point in data.points) {
                this._points[point] = Artifact.new(point, data.points[point], this);
            }
        }
        this._isBackground = data.background;
    }

    get content() {
        return this._content;
    }

    get points() {
        return this._points;
    }

    getPoint(idPoint) {
        return this._points[idPoint];
    }

    addPointFromJson(idPoint, data) {
        this.addPoint(Artifact.new(idPoint, data, this));
    }

    addPoint(point) {
        let empty = (Object.keys(this._points).length === 0)
        if (point) {
            this._points[point.id] = point;
            point.parent = this;
        }
        this.setChanged();
        let event = new ArtifactPropertyListChangedEvent(this, "add", "points", point.id, point, empty);
        this.notifyObservers(event)  ;
    }

    removePoint(idPoint) {
        delete this._points[idPoint];
        this.setChanged();
        let event = new ArtifactPropertyListChangedEvent(this, "remove", "points", idPoint);
        this.notifyObservers(event)  ;
    }

    get isBackground() {
        return this._isBackground;
    }

    set background(isBackground) {
        this._addModification("background", this.isBackground, isBackground);
        this._isBackground = isBackground;
        this.setChanged();
        let event = new ArtifactStatusEvent(this, "background");
        this.notifyObservers(event);
        for (let id in this.points){
            this.getPoint(id).visible = isBackground;
        }
        this.visible = (! isBackground );
    }
    
    toJSON() {
        var object = super.toJSON();
        object['content'] = this._content;
        object['points'] = {};
        for (var id in this._points) {
            object['points'][id] = this._points[id].toJSON();
        }
        object['isBackground'] = this._isBackground;
        return object;
    }
}