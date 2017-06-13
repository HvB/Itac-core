/* 
 * tableau de parametres permettant de definir les liens vers les pages dynamique en fonction du type d'icone associé
 */
 var paramITAC = [];

 paramITAC['itacapp-collab'] = new Array('collab.png','collaboration.jpg','collab/config');
 paramITAC['itacapp-collab-config1'] = new Array('collab.png','collaboration.jpg','collab/preconfig/1');
 paramITAC['itacapp-vide'] = new Array('rond.png','vide.jpg','test.html');
 paramITAC['itacapp-check'] = new Array('rond.png','check.jpg','test.html');
 paramITAC['itacapp-calcul'] = new Array('rond.png','calcul.jpg','test.html');
 paramITAC['itacapp-meteo'] = new Array('rond.png','meteo.jpg','test.html');
 paramITAC['itacapp-param'] = new Array('rond.png','param.jpg','test.html');
 paramITAC['itacapp-domotique'] = new Array('rond.png','domotique.jpg','domotique');
 paramITAC['itacapp-quete'] = new Array('rond.png','quete.jpg','test.html');
 paramITAC['itacapp-morpix'] = new Array('morpion.png','morpix.jpg','morpion');
 
 
var paramZAITAC = [];
// contennu du tableau : taille en largeur , taille en hauteur, nb de ZE max en largeur, nb ZE max en hauteur, % de l'espacement , hauteur de la ZE 
paramZAITAC['Table1'] = new Array(1920,1080,5,2,20,70); 
paramZAITAC['Table2'] = new Array(1920,1080,5,2,20,70); 
paramZAITAC['Table3'] = new Array(1920,1080,5,2,20,70); 
paramZAITAC['Ecran1'] = new Array(1920,1080,5,2,20,70); 

 

function date(id) {
	
	//initLogo(); 
	
	var ladate=new Date();
	
	var tab_mois=new Array("Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre");
	var tab_jour=new Array("Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi");
	
	var h = ladate.getHours();
	var m = ladate.getMinutes();

    if(h<10) {h = "0"+h;}
    if(m<10) {m = "0"+m;}
       

     document.getElementById("date").innerHTML = tab_jour[ladate.getDay()] + " " + ladate.getDate() + " " + tab_mois[ladate.getMonth()] + " " + ladate.getFullYear();
     document.getElementById("heure").innerHTML = h + " : " + m;
     
     setTimeout('date("'+id+'");','1000');
     
     return true;
}




function imageMenu(paramITAC,param) {
	
	var fichier = "img/"+paramITAC[param][0];
	
	//document.getElementById(param).src= "img/"+ paramITAC[param][0];
	return fichier;

}

function initLogo() {

	/*document.getElementById("change").style.marginLeft="50px";
	document.getElementById("change").style.marginTop="20px";*/
	document.getElementById("change").style.backgroundImage =  "url('img/logoITAC.png')";

}

function changeImage(paramITAC,param) {

	document.getElementById("change").style.backgroundImage =  "url('img/"+ paramITAC[param][1]+"')";

}





