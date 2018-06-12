class Message extends Artifact {
    constructor(id, data) {
        super(id, ARTIFACT_MESSAGE, data);
        this._title = data && data.title ? data.title : '';
        this._content = data && data.content ? data.content : '';
    }

    get title() {
        return this._title;
    }

    get content() {
        return this._content;
    }

    toJSON() {
        var object = super.toJSON();
        object['title'] = this._title;
        object['content'] = this._content;
        return object;
    }
}