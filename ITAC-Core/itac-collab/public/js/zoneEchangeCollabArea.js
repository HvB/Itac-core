/* ==========================================
 *  les zones d'echange
 * ==========================================
 */
interact('.zoneEchange').dropzone({

    // --> accepter juste les element de la class artefact
    accept: '.artefact',

    // --> il faut 10% de l'element soit dans la zone pour que le drop est possible
    overlap: 0.1,

    // -- >les evenement de drop

    ondropactivate: function (event) {
        //activer la zone de drop
        event.target.classList.add('drop-active');
    },

    // --> lorsque l artefact entre la zone
    ondragenter: function (event) {

        var draggableElement = event.relatedTarget,
            zoneEchangeElement = event.target,

            dropRect= interact.getElementRect(event.target),
            dropCenter = {
                x: dropRect.left+dropRect.width / 2 ,
                y: dropRect.top+dropRect.height /2
            };

        //la possibilité de drop
        zoneEchangeElement.classList.add('drop-target');
        draggableElement.classList.add('can-drop');
    },

    ondragleave: function (event) {
        //supprimer les classes ajoutées aprés le drop
        event.target.classList.remove('drop-target');
        event.relatedTarget.classList.remove('can-drop');
        event.relatedTarget.classList.remove('dropped-image');
        event.relatedTarget.classList.remove('dropped-msg');
        event.relatedTarget.classList.remove('left');
        event.relatedTarget.classList.remove('right');
        event.relatedTarget.classList.remove('top');

        // on recupeère les identifiant
        var idAr = event.relatedTarget.id;
        var idZE = event.target.id;
        console.log('ondragleave d un Artefact (' +idAr +') de la ZE= ' +idZE +' vers la ZP= '+zpdemande);

        console.log('ondragleave d un Artefact --> emission sur soket de [EVT_EnvoieArtefactdeZEversZP] idSocket ='+socket.id+' idAR='+idAr+' idZE='+idZE+' zpdemande='+zpdemande);
        socket.emit('EVT_Envoie_ArtefactdeZEversZP', idAr, idZE , zpdemande);
        console.log('ondragleave d un Artefact --> [OK} evenement emis [EVT_EnvoieArtefactdeZEversZP] ');

        //revenir à la classe initialle
        //event.relatedTarget.classList.add('artefact');
        $(event.relatedTarget).find("p").show();
        //affichage du contenu
    },

    ondrop: function (event) {
        //les evenements aprés le drop
        var idAr = event.relatedTarget.id;
        var idZE = event.target.id;
        console.log('ondrop d un Artefact (' +idAr +') vers ZE= ' +idZE );

        event.relatedTarget.classList.remove('can-drop');

        var titre = $(event.relatedTarget).find("h1").text(); //le titre de lartefact
        var message= $(event.relatedTarget).find("p").text();  //le contenu

        var bg = $(event.relatedTarget).css('background-image'); //l'image
        bg=bg.replace('url(','').replace(')','');
        var className = $(event.relatedTarget).attr('class');

        console.log('ondrop d un Artefact --> className ='+className);
        if ( (className != "draggable artefact dropped-msg") & (className != "draggable artefact img dropped-image") & (className != "draggable artefact img dropped-image right")& (className != "draggable artefact img dropped-image left")& (className != "draggable artefact img dropped-image top") & (className != "draggable artefact dropped-msg left")& (className != "draggable artefact dropped-msg right ")& (className != "draggable artefact dropped-msg top"))
        {
            var idAr = event.relatedTarget.id;
            var idZE=event.target.id;
            console.log('ondrop d un Artefact --> emission sur soket de [EVT_EnvoieArtefactdeZPversZE]');
            socket.emit('EVT_Envoie_ArtefactdeZPversZE', idAr, idZE);
        }

        //selon la classe (image ou artefact normal) on organise les drops (rotations et affichage)
        var className = $(event.relatedTarget).attr('class');

        $(event.relatedTarget).hide();



        if (className == "draggable artefact")  {

            $("<div  id= "+event.relatedTarget.id+" class='draggable artefact dropped-msg "+orientationZE[idZE]+"' >  <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target);

        }
        else if ((className == "draggable artefact img") || (className == "draggable artefact img selected")) {
            $("<div  id= "+event.relatedTarget.id+" class='draggable artefact img dropped-image "+orientationZE[idZE]+"' > <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target).css("background-image", "url("+bg+")");
        }



    },
    ondropdeactivate: function (event) {


        //supprimer le drop-active class de la zone de drop

        event.target.classList.remove('drop-active');
        event.target.classList.remove('drop-target');
    }
});

