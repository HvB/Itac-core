class Artifact {
    static new(id, data , parent) {
        let a;
        switch (data.type) {
            case ARTIFACT_MESSAGE:
                a = new Message(id, data);
                break;
            case ARTIFACT_IMAGE:
                a = new Image(id, data);
                break;
            case ARTIFACT_LINK:
                a = new Link(id, data);
                break;
            case ARTIFACT_POINT:
                a = new Point(id, data, parent);
                break;
            default:
                // cas on cela ne rentre pas dans les categories précédentes
                a = new Artifact(id, data.type, data, parent);
        }
        return a;
    }

    constructor(id, type, data) {
        // originel json data
        this._data = data ? data : {};
        this._id = id ? id : guid();
        this._type = type;
        if ( ! this._data.position ) this._data.position = {x:0, y:0, scale:1, angle:0};

        this._position = new Proxy(this._data.position, jsonPositionProxyHandler);
        let x = this._position.x;
        let y = this._position.y;
        this._x = x;
        this._y = y;
        this._scale = this._position.scale;
        this._angle = this._position.angle;
        this._ZE = data && data.lastZE ? data.lastZE : null;
        this._creator = data && data.creator ? data.creator : null;
        this._dateCreation = data && data.dateCreation ? data.dateCreation : new Date().toISOString();
        this._history = data && data.history ? data.history : [];
        this._observers = new Set();
        this._changed = false;
        this._status = "new";
        this._dx = 0;
        this._dy = 0;
        this._da = 0;
        this._ds = 0;
        this._modifications = [];
    }

    get id() {
        return this._id;
    }

    get type() {
        return this._type;
    }

    get x() {
        return (this._x + this._dx);
    }

    set x(x) {
        this._x = x;
        this._dx = 0;
        this.setChanged();
    }

    get y() {
        return (this._y + this._dy);
    }

    set y(y) {
        this._y = y;
        this._dy = 0;
        this.setChanged();
    }

    getX(unit="px", refX=0) {
        let h = window.innerHeight;
        let w = window.innerWidth;
        let val = this.x;
        if (typeof refX === 'number') {
            val -= refX;
        } else if (refX == 'center') {
            val -= w/2;
        } else if (refX == 'right') {
            val -= w;
        }
        switch(unit) {
            case "px":
                val += 'px';
                break;
            case "%":
                val *= 100/w;
                val += '%';
                break;
            case "vw":
                val *= 100/w;
                val += 'vw';
                break;
            case "vh":
                val *= 100/h;
                val += 'vh';
                break;
            default:
                val += 'px';
        }
        return val;
    }

    getY(unit="px", refY=0) {
        let h = window.innerHeight;
        let w = window.innerWidth;
        let val = this.y;
        if (typeof refY === 'number') {
            val -= refY;
        } else if (refY == 'center') {
            val -= h/2;
        } else if (refY == 'bottom') {
            val -= h;
        }
        switch(unit) {
            case "px":
                val += 'px';
                break;
            case "%":
                val *= 100/h;
                val += '%';
                break;
            case "vw":
                val *= 100/w;
                val += 'vw';
                break;
            case "vh":
                val *= 100/h;
                val += 'vh';
                break;
            default:
                val += 'px';
        }
        return val;
    }

    getAngle(unit="deg", ref=0){
        let val = this.angle;
        if (typeof ref === 'number') {
            val -= ref;
        }
        val +='deg'
        return val;
    }

    get scale() {
        let s = this._scale * (1 + this._ds);
        return s;
    }

    set scale(scale) {
        this._scale = scale;
        this._ds = 0;
        this.setChanged();
    }

    get angle() {
        let a = this._angle + this._da;
        return a;
    }

    set angle(angle) {
        this._angle = angle;
        this._da = 0;
        this.setChanged();
    }

    get ZE() {
        return this._ZE;
    }

    set ZE(ZE) {
        this._addModification("ZE", this.ZE, ZE);
        this._ZE = ZE;
        this.setChanged();
    }

    get creator() {
        return this._creator;
    }

    get dateCreation() {
        return this._dateCreation;
    }

    get history() {
        return this._history;
    }

    hasLinkTo(linkTo) {
        return (this._data.linksTo && this._data.linksTo[linkTo]);
    }

    addLinkTo(linkTo) {
        let empty = (! this._data.linksTo);
        if (empty) {
            this._data.linksTo = {};
         }
        this._data.linksTo[linkTo] = linkTo;
        this.setChanged();
        let event = new ArtifactPropertyListChangedEvent(this, "add", "linksTo", linkTo, linkTo, empty);
        this.notifyObservers(event)  ;
    }

    removeLinkTo(linkTo) {
        if (this._data.linksTo) {
            delete this._data.linksTo[linkTo];
            this.setChanged();
            let event = new ArtifactPropertyListChangedEvent(this, "remove", "linksTo", linkTo);
            this.notifyObservers(event)  ;
        }
    }

    get linksTo (){
        return this._data.linksTo;
    }

    startMove(){
        this._x += this._dx;
        this._y += this._dy;
        this._angle += this._da;
        this._scale *= (1 + this._ds);
        this._dx = 0;
        this._dy = 0;
        this._ds = 0;
        this._da = 0;
        this.setChanged();
        let event =  new ArtifactStartMoveEvent(this);
        this.notifyObservers(event);
    }
    endMove(){
        // this._dx = 0;
        // this._dy = 0;
        // this._ds = 0;
        // this._da = 0;
        this.setChanged();
        let event =  new ArtifactEndMoveEvent(this);
        this.notifyObservers(event);
   }
    cancelMove(){
        this._dx = 0;
        this._dy = 0;
        this._ds = 0;
        this._da = 0;
        this.setChanged();
        let event =  new ArtifactCancelMoveEvent(this);
        this.notifyObservers(event);
    }
    move (dx, dy, ds=0, da=0){
        this._dx += dx;
        this._dy += dy;
        this._da += da;
        this._ds += ds;
        this.setChanged();
        let event =  new ArtifactMoveEvent(this);
        this.notifyObservers(event);
    }

    setXY (x, y){
        this.x = x;
        this.y = y;
        this.setChanged();
        let event =  new ArtifactMoveEvent(this);
        this.notifyObservers(event);
    }

    toJSON() {
        let object = this._data;
        object['id'] = this._id;
        object['type'] = this._type;
        //object['position'] = this.jsonPosition;
        this._syncPosition();
        object['lastZE'] = this._ZE;
        object['creator'] = this._creator;
        object['dateCreation'] = this._dateCreation;
        object['history'] = this._history;
        return object;
    }

    get jsonPosition (){
        this._syncPosition();
        return this._data.position;
    }
    get position (){
        this._syncPosition();
        return this._position;
    }

    _syncPosition(){
        this._position.x = this.x;
        this._position.y = this.y;
        this._position.angle = this.angle;
        this._position.scale = this.scale;
    }

    set position (position){
        if (position !== this.position) {
            this.x = position.x;
            this.y = position.y;
            this.angle = position.angle;
            this.scale = position.scale;
            let event = new ArtifactMoveEvent(this);
            this.notifyObservers(event);
        }
    }

    _addModification(property, oldValue, newValue){
        if (oldValue !== newValue) {
            this._modifications.push({property: property, old: oldValue, new: newValue});
            this.setChanged();
        }
    }

    setChanged(){
        this._changed = true;
    }
    clearChanged(){
        this._changed = false;
    }
    addObserver(observer){
        if (observer) {
            // console.log("artifact ("+this.id+") addObserver "+this._status);
            // let event = new ArtifactStatusEvent(this, this._status);
            this._observers.add(observer);
            // this._notifyObserver(observer, event);
        }
    }
    removeObserver(observer){
        if (observer) this._observers.delete(observer);
    }
    notifyObservers(event){
        if (this._changed ){
            this.clearChanged();
            this._observers.forEach((o) => {this._notifyObserver(o, event);});
        }
        if (this._modifications.length > 0 && event.type !== "ArtifactPropertyValueChangedEvent"){
            let myEvent = new ArtifactPropertyValueChangedEvent(this, this._modifications);
            this._modifications = [];
            this._observers.forEach((o) => {this._notifyObserver(o, myEvent);});
        }
    }
    _notifyObserver(observer, event){
        let source = this;
        if (observer && observer.update instanceof Function){
            setTimeout(observer.update.bind(observer), 0, source, event);
        }
    }

    delete(){
        this._status = "deleted";
        this.setChanged();
        let event = new ArtifactStatusEvent(this, this._status);
        this.notifyObservers(event);
        this._observers.clear();
    }

    migrate(){
        this._status = "migrated";
        this.setChanged();
        let event = new ArtifactStatusEvent(this, this._status);
        this.notifyObservers(event);
        this._observers.clear();
    }

    set visible(visible){
        if (visible) this._status = "newInZP";
        else  this._status = "hidden";
        this.setChanged();
        let event = new ArtifactStatusEvent(this, this._status);
        this.notifyObservers(event);
    }

    newInZE(){
        this._status = "newInZE";
        this.setChanged();
        let event = new ArtifactStatusEvent(this, this._status);
        this.notifyObservers(event);
    }

    newInZP(){
        this._status = "newInZP";
        this.setChanged();
        let event = new ArtifactStatusEvent(this, this._status);
        this.notifyObservers(event);
    }

    update(source, something){
    }
}

//ToDo: deplacer le proxy ailleurs ?
var jsonPositionProxyHandler = {
    defaultHeight: 1080,
    defaultWidth: 1920,
    translateLengthToDisplay: function(v){
        let h = window.innerHeight;
        let w = window.innerWidth;
        return v*h/this.defaultHeight;
    },
    translateLengthFromDisplay: function(v){
        let h = window.innerHeight;
        let w = window.innerWidth;
        return v*this.defaultHeight/h;
    },
    get: function(target, property, receiver) {
        let v = target[property];
        let h = window.innerHeight;
        let w = window.innerWidth;
        switch (property) {
            case "x":
                v = (this.translateLengthToDisplay((v ? v : 0)-this.defaultWidth/2)+w/2);
                break;
            case "y":
                v = (this.translateLengthToDisplay(v ? v : 0));
                break;
        }
        return v;
    },
    set: function(target, property, value, receiver) {
        let h = window.innerHeight;
        let w = window.innerWidth;
        switch (property) {
            case "x":
                target[property] = this.translateLengthFromDisplay((value ? value : 0)-w/2)+this.defaultWidth/2;
                break;
            case "y":
                target[property] = this.translateLengthFromDisplay(value ? value : 0);
                break;
            default:
                target[property] = value;
        }
        return true;
    }
};

//ToDo: deplacer les ArtefactEvent ailleurs ?
class ArtifactEvent {
    constructor(type, source) {
        this._type = type;
        this._source = source;
    }
    get type() {
        return this._type;
    }
    get source() {
        return this._source;
    }
}

class ArtifactMoveEvent extends ArtifactEvent {
    constructor(source) {
        super("ArtifactMoveEvent", source);
        this._jsonPosition = source.jsonPosition;
        this._position = source.position;
    }
    get jsonPosition() {
        return this._jsonPosition;
    }
    get position() {
        return this._position;
    }
}

class ArtifactEndMoveEvent extends ArtifactMoveEvent {
    constructor(source) {
        super(source);
        this._type = "ArtifactEndMoveEvent";
    }
}

class ArtifactStartMoveEvent extends ArtifactMoveEvent {
    constructor(source) {
        super(source);
        this._type = "ArtifactStartMoveEvent";
    }
}

class ArtifactCancelMoveEvent extends ArtifactMoveEvent {
    constructor(source) {
        super(source);
        this._type = "ArtifactCancelMoveEvent";
    }
}

class ArtifactPropertyValueChangedEvent extends ArtifactEvent {
    constructor(source, modifications=[]) {
        super("ArtifactPropertyValueChangedEvent", source);
        this._modifications = modifications;
    }
    addModification(property, oldValue, newValue){
         this._modifications.push({ property: property, old: oldValue, new: newValue });
    }
    get modifications (){
        return this._modifications;
    }
}

class ArtifactStatusEvent extends ArtifactEvent {
    constructor(source, status) {
        super("ArtifactStatusEvent", source);
        this._status = status;
    }
    get status() {
        return this._status;
    }
}

class ArtifactPropertyListChangedEvent extends ArtifactEvent {
    constructor(source, op, property, key, value, empty=false) {
        super("ArtifactPropertyListChangedEvent", source);
        this._op = op;
        this._property = property;
        this._key = key;
        this._value = value;
        this._property = property;
        this._emptyList = empty;
    }
    get op() {
        return this._op;
    }
    get property() {
        return this._property;
    }
    get key() {
        return this._key;
    }
    get value() {
        return this._value;
    }
    get emptyList() {
        return this._emptyList;
    }
}


