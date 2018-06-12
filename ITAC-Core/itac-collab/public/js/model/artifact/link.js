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
class Link extends Artifact {
    constructor(id, data) {
        super(id, ARTIFACT_LINK, data);
        this._title = data && data.title ? data.title : '';
    }

    get title() {
        return this._title;
    }

    get linksFrom (){
        return this._data.linksFrom;
    }

    hasLinkFrom(linkFrom) {
        return (this._data.linksFrom && this._data.linksFrom[linkFrom]);
    }

    addLinkFrom(linkFrom) {
        let empty = (! this._data.linksFrom);
        if (empty) {
            this._data.linksFrom = {};
        }
        this._data.linksFrom[linkFrom] = linkFrom;
        this.setChanged();
        let event = new ArtifactPropertyListChangedEvent(this, "add", "linksFrom", linkFrom, linkFrom, empty);
        this.notifyObservers(event)  ;
    }

    removeLinkfrom(linksFrom) {
        if (this._data.linksTo) {
            delete this._data.linksTo[linksFrom];
            this.setChanged();
            let event = new ArtifactPropertyListChangedEvent(this, "remove", "linksFrom", linkFrom);
            this.notifyObservers(event)  ;
        }
    }

    toJSON() {
        var object = super.toJSON();
        object['title'] = this._title;
        return object;
    }
}