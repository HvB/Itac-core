/********************************************************************************************************/
/* --------------------------------- Gestion de la connexion ------------------------------------------ */
/********************************************************************************************************/

if (jQuery.ui) {
    console.log('PAGE : connexionApp.ejs -> charge JQuery');
} else {
    console.log('PAGE : connexionApp.ejs -> charge JQuery');
    alert("PAGE : connexionApp.ejs : pas de chargement jQuery.ui");
}


//  TC: tout ce qui correspond à de l'envoi ou de la réception d'événements avec le serveur

console.log('PAGE : connexionApp.ejs -> on s occupe maintenant de la connexion');


// PP : ce tableau de tableau donne les parametres d'affichage de chaque ZE
// indice 1er tableau = n° de la ZE
// indice 2ieme tableau  : 0 -> largeur
//                         1 -> hauteur
//                         2 -> rotation
//                         3 -> position X - top
//                         4 -> pos Y -left
var paramAffichageZE = [];

// PP : ce tableau de tableau donne les parametres d'affichage de l'avatar dasn chaque ZE
// indice 1er tableau = n° de la ZE
// indice 2ieme tableau  : 0 -> position X
//                         1 -> position y
//                         2 -> rotation
var paramAffichageAvatarde = [];

// PP : ce tableau de tableau donne l'orientation de chaque ZE
// les valeurs d'orientation sont pré-définis : top right left down
var orientationZE = [];

// PP : declaration de la variable socket
var socket = null;

console.log('******************* PARAMETRE PASSE PAR LA REQUETE  ********************************');
console.log('PAGE ZA : workspace.ejs -> urldemande = ' + urldemande);
console.log('PAGE ZA : workspace.ejs -> zpdemande = ' + zpdemande);
console.log('PAGE ZA : workspace.ejs -> rang = ' + rang);
console.log('PAGE ZA : workspace.ejs -> ZEmax = ' + ZEmax);
console.log('****************************************************************************');
console.log('');
console.log('PAGE : workspace.ejs -> demande connection socket sur : ' + urldemande);

/* -----------------------------------*/
/*  connexion socket                  */
/* -----------------------------------*/

socket = io.connect(urldemande, {transports: ['websocket']});

console.log('PAGE ZA : workspace.ejs -> **** connexion socket ZA vers Serveur [OK] : idSocket =' + socket.id);
console.log('****************************************************************************');

/* ------------------------------------------------------*/
/* --- premiere connexion ZA (Zone d'affichage = App) ---*/
/* ------------------------------------------------------*/

socket.emit('EVT_DemandeConnexionZA', urldemande, zpdemande);
console.log('PAGE : workspace.ejs -> emission evenement EVT_DemandeConnexionZA pour ZP= ' + zpdemande);

// callback réponse OK
socket.on('EVT_ReponseOKConnexionZA', function (ZC) {
    // on récupère tout le paramétrage de la Zone Collaborative
    myZC = ZC;

    console.log('PAGE : workspace.ejs -> ZC =' + JSON.stringify(myZC));
    // console.log('PAGE : workspace.ejs -> menu App initial : ' + menu);
    console.log('PAGE : workspace.ejs -> ajout des ZP , total =' + myZC.nbZP);

    for (var i = 0; i < myZC.nbZP; i++) {
        if (i != rang) {
            console.log('PAGE : workspace.ejs -> menu App , push = ' + myZC.ZP[i].idZP + " ZP");
            $('.menu').append('<li class="send ZP" data-ZP="' + myZC.ZP[i].idZP + '">' + myZC.ZP[i].idZP + '</li>');
        }
    }
    $('.menu').circleMenu({circle_radius: 150, direction: 'full', trigger: 'none'});
    $('.overlay').hide();

    // console.log('PAGE : workspace.ejs -> menu App en cours : ' + menu);

    console.log('Zone collaborative active : ' + myZC.idZC + '\n\nBienvenue sur l\'Espace de Partage :' + myZC.ZP[rang].idZP + '\n\n');
    console.log('PAGE : workspace.ejs -> reception evenement [EVT_ReponseOKConnexionZA] pour ZP= ' + myZC.ZP[rang].idZP);

    // l�-dessous on a typeZP qui n'apparait pas
    console.log('PAGE : workspace.ejs -> parametre de ZP = ' + JSON.stringify(myZC.ZP[rang]));

    // on lance le calcul des paramètres d'affichage
    console.log('PAGE : workspace.ejs -> lancement calcul ZE sur typeZP = ' + myZC.ZP[rang].typeZP);
    calcule_Nb_ZE(myZC.ZP[rang].typeZP, ZEmax);

    console.log('PAGE : workspace.ejs -> calcul taille ZE , largeur max = ' + paramZAITAC['Table1'][0] + ' hauteur Max = ' + paramZAITAC['Table1'][1]);
    console.log('PAGE : workspace.ejs -> calcul taille ZE , NB_ZE_Largeur = ' + NB_ZE_Largeur + ' NB_ZE_Hauteur = ' + NB_ZE_Hauteur);
    console.log('PAGE : workspace.ejs -> calcul taille ZE , TailleZEenlargeur = ' + TailleZEenlargeur + ' TailleZEenhauteur = ' + TailleZEenhauteur);
    console.log('PAGE : workspace.ejs -> calcul taille ZE , TailleEspaceenlargeur = ' + TailleEspaceenlargeur + ' TailleEspaceenhauteur = ' + TailleEspaceenhauteur);

    // on cree les DIV pour les ER ??? TC: Ce serait pas des ZE ?
    $(document).ready(function () {
        for (var i = 1; i <= ZEmax; i++) {
            // principe de la codification des ZE = 'ZE' + N° de ZE
            var codeZE = 'ZE' + i;

            // on initialise le tableau des parametres pour la i eme ZE
            paramAffichageZE[codeZE] = new Array(0, 0, 0, 0, 0);

            // on initialise le tableau des parametres de l'avatar pour la i eme ZE
            paramAffichageAvatarde[codeZE] = new Array(0, 0);

            var marge = 5; // marge erreur sur la taille

            // initialisation de l'orientation de la ZE
            orientationZE[codeZE] = new Array('');

            // algo de calcul en fonction des parametres
            if (i <= NB_ZE_Largeur) {
                paramAffichageZE[codeZE][0] = TailleZEenlargeur;             // largeur
                paramAffichageZE[codeZE][1] = paramZAITAC[myZC.ZP[rang].typeZP][5];    // hauteur
                paramAffichageZE[codeZE][2] = 180;                   // rotation
                paramAffichageZE[codeZE][3] = 0;                 // pos X - top
                paramAffichageZE[codeZE][4] = paramZAITAC[myZC.ZP[rang].typeZP][5] + TailleEspaceenlargeur * i + TailleZEenlargeur * (i - 1);       // pos Y -left
                orientationZE[codeZE] = 'top';

                paramAffichageAvatarde[codeZE][0] = 60;
                paramAffichageAvatarde[codeZE][1] = 60;
                //paramAffichageAvatarde[codeZE][2]=180;

            }
            else if (i <= NB_ZE_Largeur + NB_ZE_Hauteur) {
                paramAffichageZE[codeZE][0] = paramZAITAC[myZC.ZP[rang].typeZP][5];
                paramAffichageZE[codeZE][1] = TailleZEenhauteur;
                paramAffichageZE[codeZE][2] = 270;
                paramAffichageZE[codeZE][3] = paramZAITAC[myZC.ZP[rang].typeZP][5] + TailleEspaceenhauteur * (i - NB_ZE_Largeur) + TailleZEenhauteur * (i - NB_ZE_Largeur - 1);
                paramAffichageZE[codeZE][4] = paramZAITAC[myZC.ZP[rang].typeZP][0] - paramZAITAC[myZC.ZP[rang].typeZP][5] - marge;
                orientationZE[codeZE] = 'right';

                // style ='position:relative ; top:-10 ; left: -10 ; -webkit-transform: rotate(270deg) ; transform: rotate(270deg) '
                paramAffichageAvatarde[codeZE][0] = -10;
                paramAffichageAvatarde[codeZE][1] = -10;
                //paramAffichageAvatarde[codeZE][2]=270;
            }
            else if (i <= 2 * NB_ZE_Largeur + NB_ZE_Hauteur) {
                paramAffichageZE[codeZE][0] = TailleZEenlargeur;
                paramAffichageZE[codeZE][1] = paramZAITAC[myZC.ZP[rang].typeZP][5];
                paramAffichageZE[codeZE][2] = 0;
                paramAffichageZE[codeZE][3] = paramZAITAC[myZC.ZP[rang].typeZP][1] - paramZAITAC[myZC.ZP[rang].typeZP][5] - marge;
                paramAffichageZE[codeZE][4] = paramZAITAC[myZC.ZP[rang].typeZP][5] + TailleEspaceenlargeur * (i - NB_ZE_Largeur - NB_ZE_Hauteur) + TailleZEenlargeur * (i - NB_ZE_Largeur - NB_ZE_Hauteur - 1);
                orientationZE[codeZE] = 'down';

                paramAffichageAvatarde[codeZE][0] = 0;
                paramAffichageAvatarde[codeZE][1] = 0;
                //paramAffichageAvatarde[codeZE][2]=0;
            }
            else {
                paramAffichageZE[codeZE][0] = paramZAITAC[myZC.ZP[rang].typeZP][5];
                paramAffichageZE[codeZE][1] = TailleZEenhauteur;
                paramAffichageZE[codeZE][2] = 90;
                paramAffichageZE[codeZE][3] = paramZAITAC[myZC.ZP[rang].typeZP][5] + TailleEspaceenhauteur * (i - 2 * NB_ZE_Largeur - NB_ZE_Hauteur) + TailleZEenhauteur * (i - 2 * NB_ZE_Largeur - NB_ZE_Hauteur - 1);
                paramAffichageZE[codeZE][4] = 0;
                orientationZE[codeZE] = 'left';

                paramAffichageAvatarde[codeZE][0] = -10;
                paramAffichageAvatarde[codeZE][1] = -50;
                //paramAffichageAvatarde[codeZE][2]=90;

            }

            // création du DIV pour la ieme ZE
            $("<div  id=" + codeZE + "  class='zoneEchange' orientation='" + orientationZE[codeZE] + "' style ='position:absolute ; top: " + paramAffichageZE[codeZE][3] + "px; left: " + paramAffichageZE[codeZE][4] + "px; width:" + paramAffichageZE[codeZE][0] + "px; height :" + paramAffichageZE[codeZE][1] + "px'  > </div>").appendTo("#ZP");
        } // fin for
    }); // fin function

    // TC: Je refais le code

    // Techniquement on devrait savoir à tout instant combien de ZE existent déjà.
    // On les crée en tournant dans le sens des aiguilles d'une montre.
    // La cinquième créera un décalage de la première, le 6 de la 2ième, etc.

    // Autre remarque: on peut limiter à 6 sur une 42 mais tenter 10 sur une 55 ?
    // Donc il nous faudrait la taille de la dalle comme paramètre.

    console.log('PAGE : workspace.js -> creation de div ZE nb=' + ZEmax);

});  // fin de la fonction de callback ReponseOkConnectionZA

// callback réponse NOK
socket.on('EVT_ReponseNOKConnexionZA', function (ZC) {
    myZC = ZC;
    alert('Zone collaborative active : ' + myZC.idZC + '\n\nImpossible d\'acceder a l\'Espace de Partage :' + myZC.ZP[rang].idZP + '\n\n');
    console.log('PAGE : workspace.js -> reception evenement [EVT_ReponseNOKConnexionZA] pour ZP= ' + myZC.ZP[rang].idZP);
});

// ---------------------------------------- Fin des EVT ZA ---------------------------------------------------------


/* ----------------------------- */
/* ----- connexion d'une ZE ----*/
/* ----------------------------- */

/* --- cas où une tablette a été autorisée à se connecter à l'espace de travail --*/
socket.on('EVT_NewZEinZP', function (pseudo, idZE, idZP, posAvatar) {
    //alert('Creation de ZE ='+idZE+' pour le pseudo: '+pseudo+ ' et l avatar : '+posAvatar);
    console.log('PAGE : workspace.ejs -> Creation d une ZE =' + idZE + ' \n ZEP associee = ' + idZP + '\n pour pseudo=' + pseudo);

    // fonction qui s'occupe d'afficher la tête de l'avatar
    $(function () {

        // on rajoute l'avatar dans le div de la ZE
        // $("#" + idZE + "").html("<img id=avatar" + posAvatar + " class='avatar' style ='position:relative ; top: " + paramAffichageAvatarde[idZE][0] + "px ; left: " + paramAffichageAvatarde[idZE][1] + "px ; '></img> ")
        $("#" + idZE + "").html("<img id=avatar" + posAvatar + " class='avatar' /> ")

        // La zone est prête : on peut la faire apparaître en glissant.
        $("#" + idZE + "").slideDown(1000);
    })

});


/* ------------------------------------------- */
/* ----- arrivée d'un artefact dans une ZE ----*/
/* ------------------------------------------- */


socket.on('EVT_ReceptionArtefactIntoZE', function (pseudo, idZE, chaineJSON) {
    console.log('PAGE : workspace.ejs -> reception evenement [EVT_ReceptionArtefactIntoZE] pour ZE= ' + idZE);

    // on récupère l'artifact en parsant le JSON
    art = JSON.parse(chaineJSON)

    // en fonction du type d'artefact, on crée la DIV correspondante "image" ou "texte"
    if (art.type == "image") {
        art.content = (art.content).replace(/(\r\n|\n|\r)/gm, ""); //supprimer les caractères spéciaux

        var target = $("<div id=" + art.id + " class='draggable artefact img dropped-image' style='background-image: url(data:image/png;base64," + art.content + ")'> </div>");
    }
    else {
        art.content = (art.content).replace(/(\r\n|\n|\r)/gm, "</br>"); //pour le saut de ligne
        var target = $("<div id=" + art.id + " class='draggable artefact dropped-msg'>  <h1> " + art.title + " </h1> <p style ='display: none'> " + art.content + " </p> </div>");
    }

    target.appendTo("#" + idZE + "");

})

/* ------------------------------------------------- */
/* ----- arrivée d'un artefact directement en ZP ----*/
/* ------------------------------------------------- */

socket.on('EVT_ReceptionArtefactIntoZP', function (pseudo, idZP, chaineJSON) {

    console.log('PAGE : workspace.ejs -> reception evenement [EVT_ReceptionArtefactIntoZP] pour ZP= ' + idZP);

    art = JSON.parse(chaineJSON)

    if (art.type == "image") {
        art.content = (art.content).replace(/(\r\n|\n|\r)/gm, "");
        var target = $('<div id="' + art.id + '" data-x="300" data-y="300" class="draggable artefact img" style="transform: translate(300px, 300px); background-image: url(data:image/png;base64,' + art.content + ')"> </div>');
    } else {
        art.content = (art.content).replace(/(\r\n|\n|\r)/gm, "</br>");
        var target = $('<div id="' + art.id + '" data-x="300" data-y="300" class="draggable artefact" style="transform: translate(300px, 300px);"><h1>' + art.title + '</h1><p>' + art.content + '</p></div>');
    }
    target.appendTo("#ZP");
})

/* ------------------------------------------------ */
/* ----- Suppression d'un artefact d'une ZE ----*/
/* ------------------------------------------------ */

socket.on('EVT_ArtefactDeletedFromZE', function (idAr, idZE, idZEP) {
    console.log('PAGE : workspace.js -> reception evenement [EVT_ArtefactDeletedFromZE] pour IdArt = ' + idAr + ' idZE=' + idZE + 'idZEP=' + idZEP);
    $("#" + idZE + "").find("div[id=" + idAr + "]").remove();
})


/* ------------------------------ */
/* ----- Deconnexion d'une ZE ----*/
/* ------------------------------ */

// c'est en fait EVT_SuppressZEinZP
socket.on('EVT_Deconnexion', function (pseudo, idZE) {
    $("#" + idZE + "").fadeOut();
    $("#" + idZE + "").children('.artefact').each(function (index, element) {
        $(element).removeClass('dropped-image dropped-msg left right top');
        $(element).find("p").show();
        $(element).remove().appendTo('#ZP');
    });
});

/* ------------------------------------------------ */
/* ----- Acquittement de l'envoi d'un artefact vers une autre ZP ----*/
/* ------------------------------------------------ */

socket.on('EVT_ReponseOKEnvoie_ArtefactdeZPversZP', function (idart) {
    console.log("menu ITAC -> ZP.ondrop : transfert Artefact envoye et bien recu " + idart);
});

/* ------------------------------ */
/* ----- Deconnexion d'une ZA ----*/
/* ------------------------------ */

socket.on('disconnect', function() {
    $('.overlay').show();
});


