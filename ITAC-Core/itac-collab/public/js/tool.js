/**
 * Ces fonctions sont utilisées pour gérer des formulaires dynamiques (avec des champs que l'on peut ajouter ou supprimer)
 *
 * appel depuis :
 *   --> configcollab.ejs
 */

var elementPattern = /^element(\d+)$/;
var deletePattern = /^delete(\d+)$/;

function ajouterElement() {
    var Conteneur = document.getElementById('conteneur');
    if (Conteneur) {
        Conteneur.appendChild(creerElement(dernierElement() + 1))
    }
}

function dernierElement() {
    var Conteneur = document.getElementById('conteneur'), n = 0;
    if (Conteneur) {
        var elementID, elementNo;
        if (Conteneur.childNodes.length > 0) {
            for (var i = 0; i < Conteneur.childNodes.length; i++) {
                // Ici, on vérifie qu'on peut récupérer les attributs, si ce n'est pas possible, on renvoit false, sinon l'attribut
                elementID = (Conteneur.childNodes[i].getAttribute) ? Conteneur.childNodes[i].getAttribute('id') : false;
                if (elementID) {
                    elementNo = parseInt(elementID.replace(elementPattern, '$1'));
                    if (!isNaN(elementNo) && elementNo > n) {
                        n = elementNo;
                    }
                }
            }
        }
    }
    return n;
}


//Create array of options to be added




function creerElement(ID) {
    var listeType = ["Table1", "Table2", "Table3", "Ecran1"];
    var descriptionlisteType = ["Table AIP", "Table HUCO", "Table Microsoft", "Ecran"];

    var Conteneur = document.createElement('div');
    Conteneur.setAttribute('id', 'element' + ID);

    var Label = document.createElement('label');
    Label.setAttribute('for', 'input' + ID);
    Label.innerHTML = "Espace de travail : ";

    var Input = document.createElement('input');
    Input.setAttribute('type', 'text');
    Input.setAttribute('name', 'input' + ID);
    Input.setAttribute('id', 'input' + ID);

    var Label1 = document.createElement('label');
    Label1.setAttribute('for', 'type' + ID);
    Label1.innerHTML = " Type : ";

    var Input1 = document.createElement('select');
    Input1.setAttribute('name', 'type' + ID);
    Input1.setAttribute('id', 'type' + ID);

    for (var i = 0; i < listeType.length; i++) {
        var option = document.createElement("option");
        option.value = listeType[i];
        option.text = descriptionlisteType[i];
        Input1.appendChild(option);
    }

    var Label1suite = document.createElement('label');
    Label1suite.setAttribute('for', 'visibilite' + ID);
    Label1suite.innerHTML = " Visibilite des ZE: ";

    var Input1suite1 = document.createElement('input');
    Input1suite1.setAttribute('type', 'radio');
    Input1suite1.setAttribute('name', 'visibilite' + ID);
    Input1suite1.setAttribute('id', 'visibilite' + ID);
    Input1suite1.setAttribute('value', 'true');
    var Label1suite11 = document.createElement('label');
    Label1suite11.setAttribute('for', 'visibilite' + ID);
    Label1suite11.innerHTML = "Oui";

    var Input1suite2 = document.createElement('input');
    Input1suite2.setAttribute('type', 'radio');
    Input1suite2.setAttribute('name', 'visibilite' + ID);
    Input1suite2.setAttribute('id', 'visibilite' + ID);
    Input1suite2.setAttribute('value', 'false');
    var Label1suite21 = document.createElement('label');
    Label1suite21.setAttribute('for', 'visibilite' + ID);
    Label1suite21.innerHTML = "Non";





    var Label2 = document.createElement('label');
    Label2.setAttribute('for', 'min' + ID);
    Label2.innerHTML = " Nb de connexion MIN : ";

    var Input2 = document.createElement('input');
    Input2.setAttribute('type', 'number');
    Input2.setAttribute('name', 'min' + ID);
    Input2.setAttribute('id', 'min' + ID);

    var Label3 = document.createElement('label');
    Label3.setAttribute('for', 'max' + ID);
    Label3.innerHTML = " Nb de connexion MAX : ";

    var Input3 = document.createElement('input');
    Input3.setAttribute('type', 'number');
    Input3.setAttribute('name', 'max' + ID);
    Input.setAttribute('id', 'max' + ID);

    var Label4 = document.createElement('label');
    Label4.setAttribute('for', 'port' + ID);
    Label4.innerHTML = " Port : ";

    var Input4 = document.createElement('input');
    Input4.setAttribute('type', 'number');
    Input4.setAttribute('name', 'port' + ID);
    Input4.setAttribute('id', 'port' + ID);

    var Delete = document.createElement('input');
    Delete.setAttribute('type', 'button');
    Delete.setAttribute('value', 'Supprimer'); // n°' + ID + ' !');
    Delete.setAttribute('id', 'delete' + ID);
    Delete.onclick = supprimerElement;
    Conteneur.appendChild(Label);
    Conteneur.appendChild(Input);
    Conteneur.appendChild(Label1);
    Conteneur.appendChild(Input1);

    Conteneur.appendChild(Label1suite);
    Conteneur.appendChild(Input1suite1);
    Conteneur.appendChild(Label1suite11);
    Conteneur.appendChild(Input1suite2);
    Conteneur.appendChild(Label1suite21);

    Conteneur.appendChild(Label2);
    Conteneur.appendChild(Input2);
    Conteneur.appendChild(Label3);
    Conteneur.appendChild(Input3);
    Conteneur.appendChild(Label4);
    Conteneur.appendChild(Input4);
    Conteneur.appendChild(Delete);
    return Conteneur;
}

function supprimerElement() {
    var Conteneur = document.getElementById('conteneur');
    var n = parseInt(this.id.replace(deletePattern, '$1'));
    if (Conteneur && !isNaN(n)) {
        var elementID, elementNo;
        if (Conteneur.childNodes.length > 0) {
            for (var i = 0; i < Conteneur.childNodes.length; i++) {
                elementID = (Conteneur.childNodes[i].getAttribute) ? Conteneur.childNodes[i].getAttribute('id') : false;
                if (elementID) {
                    elementNo = parseInt(elementID.replace(elementPattern, '$1'));
                    if (!isNaN(elementNo) && elementNo == n) {
                        Conteneur.removeChild(Conteneur.childNodes[i]);
                        updateElements(); // A supprimer si tu ne veux pas la màj
                        return;
                    }
                }
            }
        }
    }
};

function updateElements() {
    var Conteneur = document.getElementById('conteneur'), n = 0;
    if (Conteneur) {
        var elementID, elementNo;
        if (Conteneur.childNodes.length > 0) {
            for (var i = 0; i < Conteneur.childNodes.length; i++) {
                elementID = (Conteneur.childNodes[i].getAttribute) ? Conteneur.childNodes[i].getAttribute('id') : false;
                if (elementID) {
                    elementNo = parseInt(elementID.replace(elementPattern, '$1'));
                    if (!isNaN(elementNo)) {
                        n++
                        Conteneur.childNodes[i].setAttribute('id', 'element' + n);
                        document.getElementById('input' + elementNo).setAttribute('name', 'input' + n);
                        document.getElementById('input' + elementNo).setAttribute('id', 'input' + n);
                        document.getElementById('delete' + elementNo).setAttribute('id', 'delete' + n);
                    }
                }
            }
        }
    }
};



