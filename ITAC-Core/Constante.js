/**
 * Ensemble des constantes ITAC
 */

var Constante = function()
{
	this.typeConteneur_EP = 'EP';
	this.typeConteneur_ZE = 'ZE';
	this.typeConteneur_ZP = 'ZP';
	
	this.typeArtefact_Message = 'message';
	this.typeArtefact_Image = 'image';

	this.repArtifact ='artefacts/';
	// dossier de sauvergarde pour les sessions
	this.repSession ='sessions/';

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
	
	
	this.EVT_ReceptionArtefactMessage ='EVT_ReceptionArtefactMessage';
	this.EVT_ReceptionArtefactImage ='EVT_ReceptionArtefactImage';

	/**
	 * evenement envoyé par la ZA lorsque qu 'un artefact est sorti d'une ZE dans l'espace de travail ZP
	 */
	this.EVT_EnvoieArtefactdeZEversZP='EVT_Envoie_ArtefactdeZEversZP';

    /**
     * evenement envoyé par la ZA lorsque qu 'un artefact est depose dans une ZE depuis l'espace de travail ZP
     */
	this.EVT_EnvoieArtefactdeZPversZE='EVT_Envoie_ArtefactdeZPversZE';

	/**
	 * evenement envoye par ZEP quand une on remet un artefact dans l espace personnelle
	 */
	this.EVT_EnvoieArtefactdeZEversEP='EVT_Envoie_ArtefactdeZEversEP';
	
	/**
	 * evenement envoye par le serveur vers la ZA en ca de deconnexion
	 */
	this.EVT_EnvoieTousLesArtefactdeZEversEP='EVT_Envoie_TousLesArtefactdeZEversEP';
	
	
	/**
	 * 
	 */
	this.EVT_ArtefactDeletedFromZE='EVT_ArtefactDeletedFromZE';

	
	
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
	 * cet evenement est envoyé par la tablette quand un nouvel artefact a été crée (déposé) dans la ZE 
	 * -> utilisé dans ITAC-Core-Android / app / src / main / java / fr / learning_adventure / android / itac / model / ItacConstant.java
	 */		
	this.EVT_NewArtefactInZE='EVT_NewArtefactInZE'; 
	
	/**
	 * cet evenement est envoyé par le serveur de socket à la ZA quand un artefact est déposé dans la ZE 
	 * il est aussi renvoyé à la tablette comme acquittement à EVT_NewArtefactInZE
	 */	
	this.EVT_ReceptionArtefactIntoZE ='EVT_ReceptionArtefactIntoZE';
	
	/**
	 * cet evenement est envoyé par la tablette quand un nouvel artefact a été crée (déposé) dans la ZP
	 * -> utilisé dans ITAC-Core-Android / app / src / main / java / fr / learning_adventure / android / itac / model / ItacConstant.java
	 */		
	this.EVT_NewArtefactInZP='EVT_NewArtefactInZP';
	
	/**
	 * cet evenement est envoyé par le serveur de socket à la ZA quand un artefact est déposé dans la ZP 
	 * il est aussi renvoyé à la tablette comme acquittement à EVT_NewArtefactInZP
	 */	
	this.EVT_ReceptionArtefactIntoZP ='EVT_ReceptionArtefactIntoZP';
	
	/**
	 * cet evenement est envoyé par la ZA pour envoyer un artifact d'une ZP vers une autre ZP
	 */	
	this.EVT_EnvoieArtefactdeZPversZP='EVT_Envoie_ArtefactdeZPversZP';

	/**
	 * ces evenement sont les réponses du serveur au EVT_Envoie_ArtefactdeZPversZP
	 */
	this.EVT_ReponseOKEnvoie_ArtefactdeZPversZP ='EVT_ReponseOKEnvoie_ArtefactdeZPversZP';
	this.EVT_ReponseNOKEnvoie_ArtefactdeZPversZP ='EVT_ReponseNOKEnvoie_ArtefactdeZPversZP';
	
	/**
	 * cet evenement est envoyé par la ZA quand on supprime un artéfact d'une ZP
	 */
	this.EVT_ArtefactDeletedFromZP='EVT_ArtefactDeletedFromZP';

	/**
	 * ces evenement sont les réponses du serveur au EVT_ArtefactDeletedFromZP
	 */
	this.EVT_ReponseOKArtefactDeletedFromZP ='EVT_ReponseOKArtefactDeletedFromZP';
	this.EVT_ReponseNOKArtefactDeletedFromZP ='EVT_ReponseNOKArtefactDeletedFromZP';
};


module.exports = Constante;
