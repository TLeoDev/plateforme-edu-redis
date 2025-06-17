# Nouveaux paradigmes de bases de données
## Plateforme Éducative avec Redis et Django

### Projet

#### Description du projet

Le but de ce projet est de développer une **plateforme éducative interactive** avec des fonctionnalités basiques à l’aide de **Redis**, une base de données en mémoire, et **Django**, un framework de développement web en Python.  
Bien que vous puissiez choisir n’importe quel langage de programmation pris en charge par Redis, nous recommandons l’utilisation de Django pour ce projet.

---

#### Spécifications de l’application

La plateforme éducative doit proposer :
- des **cours**,
- des **professeurs**,
- et des **étudiants**.

Chaque **cours** doit contenir :
- un ID,
- un titre,
- un enseignant,
- une liste d’étudiants inscrits,
- ainsi que des propriétés optionnelles telles que :
    - un résumé,
    - un niveau (débutant, intermédiaire, avancé),
    - un nombre de places disponibles.

Les **professeurs** et les **étudiants** ont des **profils** contenant :
- un nom,
- un ID,
- la liste des cours :
    - auxquels ils sont inscrits (étudiants),
    - ou qu’ils enseignent (professeurs),
- la possibilité de **mettre à jour** ces informations.

---

#### Fonctionnalité Publish / Subscribe (Pub/Sub)

Implémentez un système de **nouvelles de type publish-subscribe** :

- **(a) Côté éditeur** :  
  Permettre à l’enseignant de :
    - publier des mises à jour de cours,
    - créer de nouveaux cours,
    - émettre un message de nouvelle contenant l’ID du cours mis à jour ou créé.

- **(b) Côté abonné** :  
  Permettre aux étudiants de :
    - s’abonner aux mises à jour de cours,
    - récupérer les détails d’un cours à partir d’une nouvelle par ID,
    - afficher l’entrée complète du cours depuis la base de données,
    - **s’inscrire** à un cours via la plateforme.

- **(c) Expiration des cours** :  
  Faire **expirer** les cours après un certain temps (si le cours n’est pas mis à jour ou si personne ne s’y inscrit) : ces cours ne sont alors **plus disponibles** pour l’inscription.

- **(d) Rafraîchissement de l’expiration** :  
  Si un étudiant s’inscrit à un cours (par exemple, en définissant un champ dans Redis), la **date d’expiration** du cours doit être **rafraîchie**.

---

#### Fonctionnalité de recherche

La plateforme doit inclure une **fonction de recherche** qui permet aux utilisateurs de chercher des cours par :
- titre,
- enseignant,
- niveau,
- ou d’autres critères pertinents.

---

### Livrables du projet

- Code source de l’application, incluant tous les fichiers et les dépendances nécessaires à son exécution.
- Documentation détaillée expliquant :
    - comment exécuter l’application,
    - comment installer Redis, Django, et toutes les autres dépendances nécessaires.