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
         * evenement envoyé pour modifier un artefact (maj complete de l'artefact)
         */
        ArtifactFullUpdate: 'EVT_ArtifactFullUpdate',

        /**
         * evenement envoyé pour modifier un artefact (maj partielle via un patch JSON)
         */
        ArtifactPartialUpdate: 'EVT_ArtifactPartialUpdate',

        /**
         * evenement envoyé pour modifier plusieur artefacts (maj partielle via un ensemble de patch JSON)
         */
        ArtifactsPartialUpdates: 'EVT_ArtifactsPartialUpdates',


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
        },
        repeuplement: {
            uniquementZP: 'ZP',
            ZPetZE: 'ZPetZE'
        },
    },
    log: {
        level : {
            itac : 'debug'
        }
    }
};