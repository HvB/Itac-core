/**
 * Ensemble des constantes ITAC
 */
module.exports = {
    directory: {
        artifact: 'artifact/',
        session: 'session/',
    },
    event: {
        /**
         * evenement envoyé par une ZA lorsque qu'elle se connecte à une ZP
         */
        DemandeConnexionZA: 'EVT_DemandeConnexionZA',
        /**
         * reponse OK autorisant la ZA a se connecter
         */
        ReponseOKConnexionZA: 'EVT_ReponseOKConnexionZA',
        /**
         * reponse NOK n'autorisant pas la ZA a se connecter
         */
        ReponseNOKConnexionZA: 'EVT_ReponseNOKConnexionZA',

        ConnexionSocketZA: 'EVT_ConnexionSocketZA',

        ConnexionSocketZEP: 'EVT_ConnexionSocketZEP',

        DemandeConnexionZEP: 'EVT_DemandeConnexionZEP',


        ReponseOKConnexionZEP: 'EVT_ReponseOKConnexionZEP',
        ReponseNOKConnexionZEP: 'EVT_ReponseNOKConnexionZEP',


        ReceptionArtefactMessage: 'EVT_ReceptionArtefactMessage',
        ReceptionArtefactImage: 'EVT_ReceptionArtefactImage',

        /**
         * evenement envoyé par la ZA lorsque qu 'un artefact est sorti d'une ZE dans l'espace de travail ZP
         */
        EnvoieArtefactdeZEversZP: 'EVT_Envoie_ArtefactdeZEversZP',

        /**
         * evenement envoyé par la ZA lorsque qu 'un artefact est depose dans une ZE depuis l'espace de travail ZP
         */
        EnvoieArtefactdeZPversZE: 'EVT_Envoie_ArtefactdeZPversZE',

        /**
         * evenement envoye par ZEP quand une on remet un artefact dans l espace personnelle
         */
        EnvoieArtefactdeZEversEP: 'EVT_Envoie_ArtefactdeZEversEP',

        /**
         * evenement envoye par le serveur vers la ZA en ca de deconnexion
         */
        EnvoieTousLesArtefactdeZEversEP: 'EVT_Envoie_TousLesArtefactdeZEversEP',


        /**
         *
         */
        ArtefactDeletedFromZE: 'EVT_ArtefactDeletedFromZE',


        /**
         * cet evenement est envoyé par le serveur quand une nouvelle demande de connexion
         * d'une tablette à été acceptée
         */
        CreationZC: 'EVT_CreationZC',

        /**
         * cet evenement est envoyé par le serveur quand une nouvelle demande de connexion
         * d'une tablette à été acceptée
         */
        NewZEinZP: 'EVT_NewZEinZP',
        /**
         * cet evenement est envoyé par le serveur quand une tablette se déconnecte
         */
        SuppressZEinZP: 'EVT_Deconnexion',

        /**
         * cet evenement est envoyé par la tablette quand un nouvel artefact a été crée (déposé) dans la ZE
         * -> utilisé dans ITAC-Core-Android / app / src / main / java / fr / learning_adventure / android / itac / model / ItacConstant.java
         */
        NewArtefactInZE: 'EVT_NewArtefactInZE',

        /**
         * cet evenement est envoyé par le serveur de socket à la ZA quand un artefact est déposé dans la ZE
         * il est aussi renvoyé à la tablette comme acquittement à EVT_NewArtefactInZE
         */
        ReceptionArtefactIntoZE: 'EVT_ReceptionArtefactIntoZE',

        /**
         * cet evenement est envoyé par la tablette quand un nouvel artefact a été crée (déposé) dans la ZP
         * -> utilisé dans ITAC-Core-Android / app / src / main / java / fr / learning_adventure / android / itac / model / ItacConstant.java
         */
        NewArtefactInZP: 'EVT_NewArtefactInZP',

        /**
         * cet evenement est envoyé par le serveur de socket à la ZA quand un artefact est déposé dans la ZP
         * il est aussi renvoyé à la tablette comme acquittement à EVT_NewArtefactInZP
         */
        ReceptionArtefactIntoZP: 'EVT_ReceptionArtefactIntoZP',

        /**
         * cet evenement est envoyé par la ZA pour envoyer un artifact d'une ZP vers une autre ZP
         */
        EnvoieArtefactdeZPversZP: 'EVT_Envoie_ArtefactdeZPversZP',

        /**
         * ces evenement sont les réponses du serveur au EVT_Envoie_ArtefactdeZPversZP
         */
        ReponseOKEnvoie_ArtefactdeZPversZP: 'EVT_ReponseOKEnvoie_ArtefactdeZPversZP',
        ReponseNOKEnvoie_ArtefactdeZPversZP: 'EVT_ReponseNOKEnvoie_ArtefactdeZPversZP',

        /**
         * cet evenement est envoyé par la ZA quand on supprime un artéfact d'une ZP
         */
        ArtefactDeletedFromZP: 'EVT_ArtefactDeletedFromZP',

        /**
         * ces evenement sont les réponses du serveur au EVT_ArtefactDeletedFromZP
         */
        ReponseOKArtefactDeletedFromZP: 'EVT_ReponseOKArtefactDeletedFromZP',
        ReponseNOKArtefactDeletedFromZP: 'EVT_ReponseNOKArtefactDeletedFromZP'
    },
    error: {
        ConnexionZEP_Erreur1: 'Pas de zone affichage valide',
        // ToDo : permetre au client de faire la disctinction entre l'erreur 2 et l'erreur 4
        ConnexionZEP_Erreur2: 'Nb de connexion maximum atteint',
        //ConnexionZEP_Erreur2: 'Nb de connexion maximum atteinte',
        ConnexionZEP_Erreur3: 'Authentification invalide',
        ConnexionZEP_Erreur4: 'Client déjà connecté'
    },
    type: {
        artifact: {
            image: 'image',
            message: 'message'
        },
        container: {
            EP: 'EP',
            ZE: 'ZE',
            ZP: 'ZP'
        }
    },
    log: {
        level : {
            itac : 'debug'
        }
    }
};