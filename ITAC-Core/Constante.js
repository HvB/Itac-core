/**

 * http://usejsdoc.org/

 */



/*var Constante = (function()

		{

		    var obj = {};

		    obj.typeConteneur_ZE = 1;

		    obj.typeConteneur_ZP = 0;

		    obj.ALL = [obj.ZE, obj.ZP];

		    return obj;

		})();


*/


var /**
 * 
 */
/**
 * 
 */
/**
 * 
 */
Constante = function()

{
	this.typeConteneur_EP = 'EP';
	this.typeConteneur_ZE = 'ZE';
	this.typeConteneur_ZP = 'ZP';
	
	this.typeArtefact_Message = 'message';
	this.typeArtefact_Image = 'image';

	this.repArtifact ='';

	/**
	 * evenement envoyé par une ZA lorsque qu'elle se connecte à une ZP
	 */
	this.EVT_DemandeConnexionZA= 'EVT_DemandeConnexionZA';
	/**
	 * reponse OK autorisant la ZA a se connecter
	 */
	this.EVT_ReponseOKConnexionZA ='EVT_ReponseOKConnexionZA';
	/**
	 * reponse NOK n'autorisant pas la ZA a se connecter
	 */
	this.EVT_ReponseNOKConnexionZA ='EVT_ReponseNOKConnexionZA';
	
	this.ConnexionZEP_Erreur1 = 'Pas de zone affichage valide';
	this.ConnexionZEP_Erreur2 = 'Nb de connexion maximum atteinte';
	
	this.EVT_ConnexionSocketZA ='EVT_ConnexionSocketZA';
	
	this.EVT_ConnexionSocketZEP ='EVT_ConnexionSocketZEP';
	
	this.EVT_DemandeConnexionZEP ='EVT_DemandeConnexionZEP';
	
	
	this.EVT_ReponseOKConnexionZEP ='EVT_ReponseOKConnexionZEP';
	this.EVT_ReponseNOKConnexionZEP ='EVT_ReponseNOKConnexionZEP';
	this.EVT_ReceptionArtefactIntoZE ='EVT_ReceptionArtefactIntoZE';
	this.EVT_ReceptionArtefactIntoZP ='EVT_ReceptionArtefactIntoZP';
	this.EVT_ReceptionArtefactMessage ='EVT_ReceptionArtefactMessage';
	this.EVT_ReceptionArtefactImage ='EVT_ReceptionArtefactImage';
	this.EVT_EnvoieArtefactdeZEversZP='EVT_Envoie_ArtefactdeZEversZP';
	this.EVT_EnvoieArtefactdeZPversZE='EVT_Envoie_ArtefactdeZPversZE';
	/**
	 * evenement envoye par ZEP quand une on remet une 
	 */
	this.EVT_EnvoieArtefactdeZEversEP='EVT_Envoie_ArtefactdeZEversEP';
	
	/**
	 * 
	 */
	this.EVT_ArtefactDeletedFromZE='EVT_ArtefactDeletedFromZE';

	this.EVT_ReceptionArtefactIntoZE ='EVT_ReceptionArtefactIntoZE';
	
	/**
	 * cet evenement est envoyé par le serveur quand une nouvelle demande de connexion
	 * d'une tablette à été acceptée
	 */
	this.EVT_CreationZC='EVT_CreationZC';
	
	/**
	 * cet evenement est envoyé par le serveur quand une nouvelle demande de connexion
	 * d'une tablette à été acceptée
	 */
	this.EVT_NewZEinZP='EVT_NewZEinZP';
	/**
	 * cet evenement est envoyé par le serveur quand une tablette se déconnecte 
	 */	
	this.EVT_SuppressZEinZP='EVT_Deconnexion';	
	/**
	 * cet evenement est envoyé par le serveur quand un nouvelle artefact a été crée dans la ZE 
	 */		
	this.EVT_NewArtefactInZE='EVT_NewArtefactInZE'; 
	this.EVT_NewArtefactInZP='EVT_NewArtefactInZP';
	/**
	 * cet evenement est envoyé par la ZA pour envoyer un artifact d'une ZP vers une autre
	 */	
	this.EVT_EnvoieArtefactdeZPversZE='EVT_Envoie_ArtefactdeZPversZP';
	
	this.EVT_ReponseOKEnvoie_ArtefactdeZPversZP ='EVT_ReponseOKEnvoie_ArtefactdeZPversZP';
	this.EVT_ReponseNOKEnvoie_ArtefactdeZPversZP ='EVT_ReponseNOKEnvoie_ArtefactdeZPversZP';
};


module.exports = Constante;
