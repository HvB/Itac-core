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
                a = new Artifact(id, data, parent);
        }
        return a;
    }

    constructor(id, type, data) {
        // originel json data
        this._data = data ? data : {};
        this._id = id ? id : guid();
        this._type = type;
        this._x = data && data.position && data.position.x ? data.position.x : 0;
        this._y = data && data.position && data.position.y ? data.position.y : 0;
        this._scale = data && data.position && data.position.scale ? data.position.scale : 1;
        this._angle = data && data.position && data.position.angle ? data.position.angle : 0;
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

    get scale() {
        return (this._scale * (1 + this._ds));
    }

    set scale(scale) {
        this._scale = scale;
        this._ds = 0;
        this.setChanged();
    }

    get angle() {
        return (this._angle + this._da);
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

    startMove(){
        this._x += this._dx;
        this._y += this._dy;
        this._angle += this._da;
        this._scale *= (1 + this._ds);
        this._dx = 0;
        this._dy = 0;
        this._ds = 0;
        this._da = 0;
    }
    endMove(){
        // this._dx = 0;
        // this._dy = 0;
        // this._ds = 0;
        // this._da = 0;
    }
    cancelMove(){
        this._dx = 0;
        this._dy = 0;
        this._ds = 0;
        this._da = 0;
        this.setChanged();
        this.notifyObservers("position");
    }
    move (dx, dy, ds=0, da=0){
        this._dx += dx;
        this._dy += dy;
        this._da += da;
        this._ds += ds;
        this.setChanged();
        this.notifyObservers("position");
    }

    setXY (x, y){
        this.x = x;
        this.y = y;
        this.notifyObservers("position");
    }

    toJSON() {
        let object = this._data;
        object['id'] = this._id;
        object['type'] = this._type;
        object['position'] = this.position;
        object['lastZE'] = this._ZE;
        object['creator'] = this._creator;
        object['dateCreation'] = this._dateCreation;
        object['history'] = this._history;
        return object;
    }

    get jsonPosition (){
        let x = this.x;
        let y = this.y;
        return {x: x, y: y, scale: this.scale, angle: this.angle};
    }
    get position (){
        let x = this.x;
        let y = this.y;
        return {x: x, y: y, scale: this.scale, angle: this.angle};
    }
    set position (position){
        this.x = position.x;
        this.y = position.y;
        this.angle = position.angle;
        this.scale = position.scale;
    }
    setChanged(){
        this._changed = true;
    }
    clearChanged(){
        this._changed = false;
    }
    addObserver(observer){
        if (observer) {
            this._observers.add(observer);
            this._notifyObserver(observer, this._status);
        }
    }
    removeObserver(observer){
        if (observer) this._observers.delete(observer);
    }
    notifyObservers(something){
        if (this._changed){
            this.clearChanged();
            this._observers.forEach((o) => {this._notifyObserver(o, something);});
        }
    }
    _notifyObserver(observer, something){
        let source = this;
        if (observer && observer.update instanceof Function){
            setTimeout(observer.update.bind(observer), 0, source, something);
        }
    }

    delete(){
        this._status = "deleted";
        this.setChanged();
        this.notifyObservers(this._status);
        this._observers = {};
    }

    migrate(){
        this._status = "migrated";
        this.setChanged();
        this.notifyObservers(this._status);
        this._observers = {};
    }

    newInZE(){
        this._status = "newInZE"
    }

    newInZP(){
        this._status = "newInZP"
    }

    update(source, something){
    }
}