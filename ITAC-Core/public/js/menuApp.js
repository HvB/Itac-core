  /*********************************************************************************************/
  /* TC: Gestion du menu avec Interact.js  (tout cela est maintenant délocalisé dans menuApp.js) */
  /*********************************************************************************************/

console.log('PAGE : workspace2.ejs -> préparation des méthodes pour rendre le menu draggable');

//   --------------------------   le menu est draggable   -----------------------------
interact('.menu')
  .draggable({
    inertia: true,
//l element reste dans sa zone limite , il peut pas sortir de son parent 
    restrict: {
     restriction: "parent",
      endOnly: true,
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
    // activer autoScroll  ??? (TC : J'ai mis non pour voir l'effet)
    autoScroll: false,

//appeler cette fonction a chaque action de glissement 
    onmove: dragMoveListener,
//appeler cette fontion a chaque fin de l'action de glissement 
    onend: function (event) {
    
    }
  })  

//fonction de glissement toujours appeler lorsque on fait le drag and drop (TC : quel est le rapport avec drop?)
  function dragMoveListener (event) {
    //alert("Fonction dragMoveListener du: menu");
    var target = event.target,
        // stocker la position dans les attributs data-x/data-y
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translation de l'element
    target.style.webkitTransform =
    target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';

    // mise à jour de la position 
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }
 //  ---------------------------- Fin de la partie drag  ------------------------------

// PP window.dragMoveListener = dragMoveListener;

// ----------------------------- le menu est interactif  -------------------------------
// ------------------ on définit ce qu'il se passe lors d'une action tactile de type 'simple tap'  -------


// Le menu "hand" correspond à la manipulation simple et visualiser l'icône menu
// Le menu "trash" correspond à la poubelle: destruction d'un item (nb: vérifier ce qu'il se passe vraimment)
// Le menu "pen" correspond à l'annotation de document en épiglant des zones (nb: à réactiver et vérifier)
// Le menu "change" correspond au changement de fond d'écran comme document collaboratif (TC: à faire et tester)
// Le menu "print" correspond à la prise d'un screenshot de la page complète en png (TC: régler pour enlever les ZE et ajouter le fond)

var menu = ["hand", "trash", "pen", "change", "print"];
var classmenu = ["menu hand", "menu trash", "menu pen", "menu change", "menu print"];

var contenuMenu = ["","","","",""];

/* Version TC permet de switch sur les menus 
interact('.menu').on('tap',function (event) { 
  
  var className = $(event.currentTarget).attr('class');

  for(var i=0; i<menu.length; i++) { 
        
    if (className == classmenu[i]) {
        
        (event.currentTarget).classList.remove(menu[i]); 
        if (i==menu.length-1) (event.currentTarget).classList.toggle(menu[0])
        else (event.currentTarget).classList.toggle(menu[i+1])

      }
  }   
}) */


/* --------------------------------- 
 * permet de switcher sur les menus
 * ---------------------------------
 */

interact('.menu').on('tap',function (event) { 
  
  console.log("menu App -> top");
  // detection du menu toper
  
  var listeclassName = $(event.currentTarget).attr('class').split(" ");
  var className = listeclassName[listeclassName.length-1];
  var j=0;
    //var classCSSCourante = $(event.currentTarget).classList;
  console.log("menu APP -> classname = "+className);
  console.log("menu App -> listeclassName = "+listeclassName);
  console.log("menu App -> taille menu="+menu.length);
  for(var i=0; i<menu.length; i++) { 
    console.log("menu App -> i courant="+i+" classmenu= "+menu[i]);    
    if (className == menu[i]) {
      
      if (menu[i]=="ZP") (event.currentTarget).classList.toggle(contenuMenu[i]);
        (event.currentTarget).classList.remove(menu[i]); 
                
        if (i==(menu.length-1)) {j=0;}
        else {j=i+1;}
        
        console.log("menu App -> je charge j="+j+" et menu="+menu[j]); 
        
        if (menu[j]=="ZP") (event.currentTarget).classList.toggle(contenuMenu[j]);
        (event.currentTarget).classList.toggle(menu[j]);  
    
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
        var dropzoneElement = event.target;       // le conteneur
        
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
    console.log("menu App -> ZP.ondrop : transfert ART = "+idAr+" de ZP="+idZPsource+" vers ZP="+idZPcible);
    socket.emit('EVT_Envoie_ArtefactdeZPversZP', idAr, idZPsource, idZPcible);
    console.log("menu App -> ZP.ondrop : envoi sur scket de : [EVT_Envoie_ArtefactdeZPversZP]");
      socket.on('EVT_ReponseOKEnvoie_ArtefactdeZPversZP',function(idart) {
         console.log("menu App -> ZP.ondrop : transfert Artefact envoye et bien recu "+idart);
         $(event.relatedTarget).fadeOut();
          });
  
  },
  
  ondropdeactivate: function (event) {
    // remove active dropzone feedback
    event.target.classList.remove('drop-active');
    event.target.classList.remove('trash-target');
  }
});


// -------------------------- Appui long sur icône Print pour gérer la prise de screenshot -----------

  interact('.print').on('hold', function (event) {
    alert("La table non Microsoft est configurée pour sauver en appuyant sur ctrl F3!");
    // event.preventDefault();  (TC: test pour mieux différencier du simple tap mais non probant)

    // TC: pour plus tard : ajouter un son d'appareil photo
      //var soundfile="../sons/polaroid.wav" //ici le chemin du fichier son
      //$("<bgsound src="+soundfile+" id=soundeffect loop=1 autostart=true />").appendTo("#ZP");
    
    //html2canvas(document.body, {
     // onrendered: function(canvas) {

        // traitement à faire pour ajouter le fond...

     //   document.body.appendChild(canvas);
      //  canvas.id="screenshot";
      //  canvas.style="display: none"
      //  canvas.toBlob(function(blob) {
       // saveAs(blob, "screenshot.png");}, "image/png");

        // on n'oublie pas de retirer l'élément canvas contenant le screenshot de la page
     //   document.body.removeChild(canvas);

    // TC: Autre solution en test: lancer une touche qui va faire un print screen via un logiciel win comme GreenShot.
    //  var utils = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils);
    //    utils.sendKeyEvent("keydown", 0);

    

     // }
   // })
    
   //KeyEvent.simulate(81, 81, [17,18]);
   //KeyEvent.simulate(0, 13);
   
   // alert("J essaie de lancer F2");
  })  // fin hold pour print

// TC: Une autre maniere de récupérer un printScreen...
// Impossible de choper l evenement imp écr en js pour l instant...
// essai:  on configure le imp ecr sur le petit 2 (touche num zéro) sur greenshot
function printScreen(kEvent){

      var codeTouche = kEvent.keyCode;
       // alert("C'est la touche numéro:"+codeTouche);
      switch (codeTouche)
    {
        case 0:
            console.log("imp écr");
        break; 
        case 40:
          console.log("bas");  
        break;
    
        case 38:
          console.log("haut");
        break;
    
        case 37:
          console.log("gauche");
        break;
    
        case 39:
           console.log("droite");
        break;
    }
}

 // ------------------- Gestion de la poubelle: drag and drop d'un artefact dessus --------------------- 
 interact('.trash').dropzone({
  //accepter que les elements avec ce CSS selector
  accept: '.artefact',
  // il faut 10% de l'element overlap pour que le drop soit possible
  overlap: 0.1,

              // --------------------------- Les événements de drop:  -----------------------------
  ondragenter: function (event) {
    var draggableElement = event.relatedTarget,
        dropzoneElement = event.target;
    // feedback the possibility of a drop
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
    $(event.relatedTarget).fadeOut();
  },

  ondropdeactivate: function (event) {
    // remove active dropzone feedback
    event.target.classList.remove('drop-active');
    event.target.classList.remove('trash-target');
  }
 });  // fin interact .dropzone
// -------------------------- Fin Gestion de la function poubelle /trash du menu ----------------

// -------------------------- TC: fonction pour changer le fond ----------------- 
 interact('.change').on('hold', function (event) {
    alert("Appui long pour lancer le changement de fond!");
  
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


