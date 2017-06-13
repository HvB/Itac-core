/* ------------------------- 
 * parametre globale du menu
 * -------------------------
 */


var menuCollabArea = ["hand", "trash","pen","change", "print"];
var contenuMenu = ["","","","",""];
		


//fonction de glissement toujours appeler lorsque on fait le drag and drop
function dragMoveListener (event) {
 
  var target = event.target,
      // stocker la position dans les attributs data-x/data-y
      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

  // translation de l'element
  target.style.webkitTransform =
  target.style.transform =
    'translate(' + x + 'px, ' + y + 'px)';

  // mis � jour de la position 
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
}

window.dragMoveListener = dragMoveListener;

		
/* ------------------------- 
 * le menu est draggable
 * -------------------------
 */
interact('.menu').draggable(
	{
	    inertia: true,
	    //l element reste dans sa zone limite , il peut pas sortir de son parent 
	    restrict: {
	    	restriction: "parent",
	    	endOnly: true,
	    	elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
	    },
	    // activer autoScroll
	    autoScroll: true,
	    //appeler cette fonction a chaque action de glissement 
	    onmove: dragMoveListener,
	    //appeler cette fontion a chaque fin de l'action de glissement 
	    onend: function (event) {
	    	// beeeeh : 
	    	console.log("on lance onend mais on ne sait pas pourquoi");
	    }
	}
);


/* --------------------------------- 
 * permet de switcher sur les menus
 * ---------------------------------
 */

interact('.menu').on('tap',function (event) { 
	
	console.log("menu ITAC -> top");
	// detection du menu toper
	
	var listeclassName = $(event.currentTarget).attr('class').split(" ");
	var className = listeclassName[listeclassName.length-1];
	var j=0;
    //var classCSSCourante = $(event.currentTarget).classList;
	console.log("menu ITAC -> classname = "+className);
	console.log("menu ITAC -> listeclassName = "+listeclassName);
	console.log("menu ITAC -> taille menu="+menuCollabArea.length);
	for(var i=0; i<menuCollabArea.length; i++) { 
		console.log("menu ITAC -> i courant="+i+" classmenu= "+menuCollabArea[i]);		
		if (className == menuCollabArea[i]) {
			
			if (menuCollabArea[i]=="ZP") (event.currentTarget).classList.toggle(contenuMenu[i]);
	  		(event.currentTarget).classList.remove(menuCollabArea[i]); 
	  			  		
	  		if (i==(menuCollabArea.length-1)) {j=0;}
	  		else {j=i+1;}
	  		
	  		console.log("menu ITAC -> je charge j="+j+" et menu="+menuCollabArea[j]);	
	  		
	  		if (menuCollabArea[j]=="ZP") (event.currentTarget).classList.toggle(contenuMenu[j]);
	  		(event.currentTarget).classList.toggle(menuCollabArea[j]);	
		
	  		$(function () {		        		
		        		$("#menu").html(contenuMenu[j]);
		    });	  

	  	}
	} 	
})

/* ----------------------------------------- 
 * permet d'envoyer un artefact vers une ZP
 * ----------------------------------------
 */

interact('.ZP').dropzone({
  //accepter que les elements avec ce CSS selector
  accept: '.artefact',
  // il faut 10% de l'element overlap pour que le drop soit possible
  overlap: 0.1,

  // les evenements de drop:
  ondragenter: function (event) {
	  	var draggableElement = event.relatedTarget;   // l'objet ddeplacé
        var dropzoneElement = event.target;			  // le conteneur
        
        console.log("menu ITAC -> ZP.ondragenter , draggableElement="+draggableElement );
        //$(event.relatedTarget)
        // on masque l'élément
        
        $(event.relatedTarget).find("h1").hide();
        $(event.relatedTarget).find("p").hide();

        dropzoneElement.classList.add('trash-target');
        draggableElement.classList.add('can-delete');
  },
 
  ondragleave: function (event) {
    event.target.classList.remove('trash-target');
    event.relatedTarget.classList.remove('can-delete');
    $(event.relatedTarget).find("h1").show();
    $(event.relatedTarget).find("p").show();
  },
  
  ondrop: function (event) {
	  
	  // bizarre bug js ? pour relatedTarget il faut le value et pas pour target
	  var idAr = $(event.relatedTarget).context.attributes[0].value;
	  var idZPsource =zpdemande;
	  var idZPcible = $(event.target).context.classList[1];
	  console.log("menu ITAC -> ZP.ondrop : transfert ART = "+idAr+" de ZP="+idZPsource+" vers ZP="+idZPcible);
	  socket.emit('EVT_Envoie_ArtefactdeZPversZP', idAr, idZPsource, idZPcible);
	  console.log("menu ITAC -> ZP.ondrop : envoi sur scket de : [EVT_Envoie_ArtefactdeZPversZP]");
	  	socket.on('EVT_ReponseOKEnvoie_ArtefactdeZPversZP',function(idart) {
	  		 console.log("menu ITAC -> ZP.ondrop : transfert Artefact envoye et bien recu "+idart);
	  		 $(event.relatedTarget).fadeOut();
          });
	
  },
  
  ondropdeactivate: function (event) {
    // remove active dropzone feedback
    event.target.classList.remove('drop-active');
    event.target.classList.remove('trash-target');
  }
});
	
/* ----------------------------------------- 
 * permet de supprimer un artefact 
 * ----------------------------------------
 */

interact('.trash').dropzone({
  //accepter que les elements avec ce CSS selector
  accept: '.artefact',
  // il faut 10% de l'element overlap pour que le drop soit possible
  overlap: 0.1,

  // les evenements de drop:
  ondragenter: function (event) {
	  	var draggableElement = event.relatedTarget;   // l'objet ddeplacé
        var dropzoneElement = event.target;			  // le conteneur

        //$(event.relatedTarget)
        // on masque l'élément
        $(event.relatedTarget).find("h1").hide();
        $(event.relatedTarget).find("p").hide();

        dropzoneElement.classList.add('trash-target');
        draggableElement.classList.add('can-delete');
  },
 
  ondragleave: function (event) {
    event.target.classList.remove('trash-target');
    event.relatedTarget.classList.remove('can-delete');
    $(event.relatedTarget).find("h1").show();
    $(event.relatedTarget).find("p").show();
  },
  
  ondrop: function (event) {
	
	var idAr = $(event.relatedTarget).context.attributes[0].value;
	console.log("menu ITAC -> suppresion ART = "+idAr);
	socket.emit('EVT_ArtefactDeletedFromZP', idAr);
	$(event.relatedTarget).fadeOut();
  },
  
  ondropdeactivate: function (event) {
    // remove active dropzone feedback
    event.target.classList.remove('drop-active');
    event.target.classList.remove('trash-target');
  }
});

/* ----------------------------------------- 
 * permet de faire une copie d'ecran (appui long)
 * ----------------------------------------
 */

interact('.print').on('hold', function (event) {
  alert("Appui long pour lancer le screenshot!");
  // event.preventDefault();  (TC: test pour mieux différencier du simple tap mais non probant)

  // TC: pour plus tard : ajouter un son d'appareil photo
    //var soundfile="../sound/polaroid.wav" //ici le chemin du fichier son
    //$("<bgsound src="+soundfile+" id=soundeffect loop=1 autostart=true />").appendTo("#ZP");
  
  html2canvas(document.body, {
    onrendered: function(canvas) {

      // traitement à faire pour ajouter le fond...

      document.body.appendChild(canvas);
      canvas.id="screenshot";
      canvas.style="display: none"
      canvas.toBlob(function(blob) {
      saveAs(blob, "screenshot.png");}, "image/png");

      // on n'oublie pas de retirer l'élément canvas contenant le screenshot de la page
      document.body.removeChild(canvas);
    }
  })
 
})  // fin hold pour print

/* ----------------------------------------- 
 * permet de changer le fond
 * ----------------------------------------
 */
 interact('.change').on('hold', function (event) {
    //alert("Appui long pour lancer le changement de fond!");
  
  var fileInput = document.querySelector('#file');
  var fileName ="";
      
      // On force le déclenchement du bouton masqué sous le menu
     fileInput.click();
    
      // On récupère le nom du fichier sélectionné (le multiple permet de récupérer éventuellement plusieurs fichiers: là ça n est pas nécessaire
      // Mais qui peut le plus peut le moins...
      fileInput.addEventListener('change', function() {
        fileName = this.files[0].name;
         
         // On vérifie que l'utilisateur a bien sélectionné quelque chose
         if (fileName != "") 
      {  
        // TC Pourri comme technique mais pas moyen de recup le PATH  
          var longFileName= "/images/collab/fond/"+fileName;
        //alert("nom de fichier long:"+longFileName);
          document.getElementById("ZP").setAttribute('style', 'background-image:url("'+longFileName+'");');
      }  
    });
 
  });
