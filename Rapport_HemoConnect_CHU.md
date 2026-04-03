# HemoConnect CHU

Application web de gestion des transfusions sanguines développée pour digitaliser la création, le suivi et le traitement des demandes de transfusion entre les centres hospitaliers, le centre du sang et l’administration.

## Aperçu du projet

A-Transfusion est une plateforme web moderne conçue pour améliorer la traçabilité, la rapidité et la sécurité dans la gestion des transfusions sanguines.  
Le système permet de centraliser les demandes, de suivre leur état en temps réel, de gérer le stock sanguin et d’assurer une meilleure coordination entre les différents acteurs.

## Objectifs

- Digitaliser la gestion des demandes de transfusion
- Améliorer la communication entre les centres hospitaliers et le centre du sang
- Assurer une meilleure traçabilité des opérations
- Gérer le stock sanguin selon le groupe sanguin et le type de produit
- Sécuriser l’accès aux données via une gestion des rôles et permissions

## Acteurs du système

### Centre hospitalier
- Créer une demande de transfusion
- Suivre l’état de ses demandes
- Annuler une demande tant qu’elle n’est pas confirmée

### Centre du sang
- Consulter les demandes
- Traiter les demandes
- Gérer le stock sanguin
- Mettre à jour les quantités disponibles

### Administrateur principal
- Gérer les utilisateurs
- Confirmer, modifier ou supprimer les demandes
- Consulter les statistiques et l’historique

### Administrateur superviseur
- Consulter les utilisateurs
- Suivre les demandes
- Consulter les statistiques et l’historique
- Accès en lecture seule

## Produits sanguins pris en charge

- Sang total
- Plasma
- Globules rouges
- Globules blancs

## Fonctionnalités principales

- Authentification sécurisée
- Gestion des rôles et permissions
- Gestion des utilisateurs
- Création et suivi des demandes
- Annulation des demandes non confirmées
- Gestion du stock sanguin
- Historique des actions
- Tableau de bord avec statistiques

## Technologies utilisées

### Backend
- Laravel
- REST API
- Sanctum ou JWT
- MySQL

### Frontend
- React
- Axios
- React Router
- CSS / Tailwind / Bootstrap selon ton choix

## Structure du projet

```bash
HemoConnect CHU/
├── backend/    # Laravel API
├── frontend/   # React application
└── README.md