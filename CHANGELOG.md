# Changelog

## Version 2.0 (2017-12-26)

Types d'artefacts supportés :
* messages
* images
* points (dans les images)

Il est possible de lier les points aux artefacts images ou messages ou de lier les artefacts 
images ou messages les uns aux autres.

### Fonctionnalites utilisables :
* Transferts d'artéfacts entre les tablettes et la table.
* Création et édition des artéfacts sur les tablettes.
* Déplacement des artéfacts sur la table.
* Mise en fond d'écran d'un artefact image.
* Transfert d'artéfacts de ZP à ZP.
* Gestion des déconnections / reconnections des tables tactiles et des tablettes. 
* Ajout / suppression  de points sur les images placés en fond d'écran.
* Création et affichage de liens entre les points et les artéfacts. 
* Créaton et affichage de liens entre artéfacts (images / messages). 
* Suppression de liens entre artéfacts (point / images / messages).
* Gestions des écrans de géometries différentes (nb de pixels /  aspect ratio) - 
nécessite un rafraichissement du navigateur (F5). 
* Prise en compte du changement du niveau de zoom (navigateur / système). 

### Problèmes connus : 
* Pb lors du changement de zone simultanée d'un même artéfact sur la table et sur la tablette (bug #34)

### ITAC Server
* Amélioration de la stablilité du serveur.
* Gestion des déconnections/reconnections (tablette / table). 
* Amélioration disposistif d'authentification (pour les tablettes). 
* Amélioration gestion des sessions (chargement / fermeture / sauvegarde / restauration). 
* Transfert d'artéfacts de ZP à ZP. 
* Ajout possibilité d'étendre les artefacts (ajout d'attributs supplémentaires) ou 
d'avoir de nouveaux types d'artéfacts. 
* Ajout gestion des positions des artéfacts sur la table. 
* Creation d'un service de mise à jour des artéfacts (maj partielle ou complète). 
* modification du port pour le serveur (3000->9000)

### ITAC client (table computer / interactive whiteboard)
* Réecriture du client pour la table tactile ou l'écran tactile.
* Gestion deconnection/reconnection (avec le serveur ou les tablettes). 
* Transfert d'artéfacts vers une autre ZP. 
* Ajout d'un dock d'outils aux ZE.
* Possibiliteé d'ajouter des points sur des images en fond d'écran et des les lier aux autres artefacts 
(messages ou images).
* Possibilité de créer des liens entre les artéfacts images ou messages.
* Possibilité de supprimer des liens entre les artéfacts.
* Ajout option de sauvegarde de la session en cours sur le menu.
* Ajout QR-code sur le menu pour simplifier la connection des clients. 
* Ajout possibilité de déplacer les ZE (Zones d'échange) sur la table. 
* Synchronisation des modifications des artéfacts sur la table avec le serveur. 
(position des artéfacts sur la table / mise en fond d'écran / gestion des points sur les images / gestions des lients entre les artéfacts). 
* Gestions des écrans de géometries différentes (nb de pixels /  aspect ratio). 
* Prise en compte du changement du niveau de zoom (navigateur / système). 
* Suppression affichage historique des modifcations des artéfacts sur la table

## Version 1.0 (2017-07-13)

1ère version à peu près fonctionnelle du serveur et de la table ITAC (sauf reconnection).  
À utiliser avec la version 1.0 du client android ITAC.

### Types d'artefacts supportés :
* messages
* images

### Fonctionnalites utilisables :
* Transferts d'artéfacts entre les tablettes et la table.
* Création et édition des artéfacts sur les tablettes.
* Déplacement des artéfacts sur la table (pas de sauvegarde de la position des artéfacts sur le serveur).
* Mise en fond d'écran d'un artefact image.

### Problèmes connus : 
* déconnection / reconnection entre le serveur et la table ou les tablettes).

### ITAC Server

TBD

### ITAC client (table computer / interactive whiteboard)

TBD

