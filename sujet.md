Description du Projet
Le but de ce projet est de d´evelopper une plateforme ´educative interactive avec des fonctionnalit´es basiques `a l’aide de Redis, une base de donn´ees en m´emoire, et Django, un framework de
d´eveloppement web en Python. Bien que vous puissiez choisir n’importe quel langage de programmation pris en charge par Redis, nous recommandons l’utilisation de Django pour ce projet.
Sp´ecifications de l’application
1. La plateforme ´educative doit proposer des cours, des professeurs et des ´etudiants. Chaque
   cours a un ID, un titre, un enseignant et une liste d’´etudiants inscrits. Les cours peuvent ´egalement avoir d’autres propri´et´es, telles que le r´esum´e du cours, le niveau du cours
   (d´ebutant, interm´ediaire, avanc´e), et le nombre de places disponibles.
2. Les professeurs et les ´etudiants ont des profils contenant des informations telles que le nom,
   l’ID, les cours auxquels ils sont inscrits (pour les ´etudiants) ou les cours qu’ils enseignent
   (pour les professeurs). Les profils doivent ´egalement inclure des fonctionnalit´es pour mettre
   `a jour ces informations.
3. Impl´ementez un syst`eme de nouvelles de type publish-subscribe qui :
   (a) Du cˆot´e de l’´editeur, permet `a l’enseignant de publier des mises `a jour de cours, de cr´eer
   de nouveaux cours et d’´emettre un message de nouvelles contenant l’ID du cours mis `a
   jour ou nouvellement cr´e´e.
   (b) Du cˆot´e de l’abonn´e, permet aux ´etudiants de s’abonner aux mises `a jour du cours,
   de r´ecup´erer les d´etails du cours `a partir d’une nouvelle par l’ID et d’afficher l’entr´ee
   compl`ete du cours `a partir de la base de donn´ees. Les ´etudiants doivent ´egalement
   pouvoir s’inscrire `a des cours via la plateforme.
   (c) Faites expirer les cours apr`es un certain temps (si le cours n’est pas mis `a jour ou si
   personne ne s’y inscrit) : ces cours ne sont plus disponibles pour l’inscription.
   (d) Si un ´etudiant s’inscrit `a un cours (par exemple, en d´efinissant un certain champ dans
   la base de donn´ees), fait rafraˆıchir la date d’expiration du cours.
4. La plateforme doit ´egalement inclure une fonction de recherche qui permet aux utilisateurs
   de chercher des cours par titre, enseignant, niveau, ou d’autres crit`eres pertinents.
   1
   Livrable du Projet
   • Code source de l’application, y compris tous les fichiers et les d´ependances n´ecessaires pour
   ex´ecuter l’application.
   • Documentation d´etaill´ee expliquant comment ex´ecuter l’application, y compris l’installation
   de Redis, Django et de toute autre d´ependance n´ecessaire.