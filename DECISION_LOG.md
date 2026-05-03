# 🛡️ MALIKITE ACADEMY — DECISION LOG

Ce document trace l'évolution technique et académique du projet. Toute modification majeure doit y être consignée.

---

## [2026-04-30] — Phase 1 : Modernisation & Stabilisation

### 1. Refonte UI/UX "Premium"
- **Décision** : Passage à une interface haut de gamme (Glassmorphism, animations fluides, typographie arabe `Inter` + `Amiri`).
- **Impact** : Expérience utilisateur radicalement améliorée.

### 2. Architecture API Résiliente
- **Décision** : Abandon du SDK Google AI Studio au profit d'appels REST bruts via `fetch`.
- **Innovation** : Implémentation du **"Double Transport"** (Node Fetch + Fallback via `curl.exe` système) pour contourner les instabilités réseau locales sur Windows.
- **Modèle** : Passage à `gemini-2.5-flash` (version `v1beta`).

---

## [2026-05-01] — Phase 2 : Excellence Académique & Moteur de Recherche

### 3. Enrichissement du Schéma de Données (05:23)
- **Action** : Mise à jour de `types.ts` pour supporter une structure académique riche.
- **Nouveaux champs** : `matn`, `evidence`, `disagreement`, `mnemonics`, `riddles`.

### 4. Protocole "Authentic Maliki" (05:33)
- **Décision** : Forcer l'IA à adopter la posture d'un savant malékite.
- **Règle** : Chaque leçon doit commencer par un **Matn** authentique suivi d'un **Sharh** (explication).
- **Quiz** : Augmentation à 7 questions pour plus de rigueur.

### 5. Upgrade "Études Supérieures" (12:06 - 12:09)
- **Décision** : Basculer vers un contenu de niveau Master/Doctorat.
- **Inspiration** : Adaptation de la structure "Hanbali Graduate Level" (8 parties) au contexte Malékite.
- **Structure Finale (8 Sections)** :
    1. `nazmOrMatn` (Source originale)
    2. `content` (Rapport fقهي dense)
    3. `evidence` (Extraction Ousouli : Nass, Zahir, etc.)
    4. `examples` (Cas rares et contemporains)
    5. `riddles` (Énigmes de Malaka)
    6. `comparativeFiqh` (Khilaf Al-Ali - Style *Bidayat al-Mujtahid*)
    7. `references` (Sources primaires : *Mudawwana*, *Khalil*)
    8. `quiz` (7 questions académiques)
- **Refonte UI** : Mise à jour de `LessonView.tsx` pour supporter l'affichage dynamique de ces 8 sections avec une esthétique de manuscrit moderne.

---

## [2026-05-01] — Phase 3 : Traçabilité (En cours)

### 6. Création du Log de Décisions (13:19)
- **Action** : Création du présent fichier `DECISION_LOG.md` pour garantir la pérennité du projet et faciliter les modifications futures.

---

---  

## [2026-05-02] — Phase 6 : Simplification & Robustesse (08:15)

### 11. Nettoyage du Sélecteur de Modèle
- **Décision** : Suppression du sélecteur de modèle dans l'UI, affichage fixe du modèle par défaut (Gemini 2.5 Pro via OpenRouter).
- **Impact** : Interface plus épurée, réduction des points de défaillance, configuration figée.
- **Implementation** : Modification de `index.tsx` et `store.ts` pour verrouiller la configuration, et simplification de `api/generate-lesson.ts` à une unique voie OpenRouter.

### 12. Consolidation de l'API
- **Décision** : Simplification de `api/generate-lesson.ts` pour ne garder que la logique OpenRouter avec le modèle Gemini 2.5 Pro.
- **Impact** : Réduction du code, fiabilité accrue, élimination des blocs OpenAI et Gemini Direct.

---

## [2026-05-02] — Phase 7 : Résolution Complète & Production (12:40)

### 13. Proxy Vite pour Communication Dev
- **Problème** : Frontend tentait d'appeler `localhost:3006` directement → CORS & erreurs de canal.
- **Solution** : Configuration du proxy Vite (`vite.config.ts`) pour rediriger `/api/*` → `http://localhost:3006`.
- **Impact** : Communication frontend/backend fluide en développement.

### 14. Gestion des Timeouts OpenRouter
- **Problème** : Requêtes bloquantes (MAX_TOKENS), délais de 60s insuffisants, format `response_format` faisant planter Gemini.
- **Solution** : 
  - Augmentation du timeout à 120s (store) et 8000 tokens (API)
  - Suppression de `response_format: { type: 'json_object' }`
  - Ajout d'un timeout d'abandon à 15s sur chaque requête fetch
- **Impact** : Générations longues supportées sans blocage.

### 15. Parsing JSON Robuste (Markdown & Erreurs)
- **Problème** : Gemini retourne du JSON dans des blocs markdown \`\`\`json avec des erreurs de formatage.
- **Solution** : Nettoyage préalable des blocs markdown, gestion des erreurs de parsing avec logs détaillés.
- **Impact** : Aucun crash sur formatage imparfait de l'IA.

### 16. Conversion Champ `content` (Chaîne → Tableau)
- **Problème** : Le type `LessonContent.content` attend `string[]` mais l'API retournait `string`. Cause : `(lessonContent.content || []).map is not a function`.
- **Solution** : 
  - Division du contenu texte en paragraphes via expression régulière
  - Validation de cache stricte (invalide si format obsolète)
- **Impact** : Le composant `LessonView.tsx` fonctionne sans erreur, types cohérents.

### 17. Architecture Double Serveur
- **Frontend Vite** : `http://localhost:3005`
- **Backend API** : `http://localhost:3006`
- **Communication** : Proxy Vite transparent `/api/*` → backend
- **Impact** : Séparation nette, scalabilité, stabilité accrue.

### 18. Suppression du mot "BEGINNER" (Anglais) sans supprimer le niveau
- **Problème** : L'utilisateur a signalé que le mot "BEGINNER" en anglais apparaissait dans l'interface arabe, ce qui est inapproprié.
- **Solution** : 
  - Restauration du niveau `BEGINNER` (précédemment supprimé par erreur d'interprétation).
  - Traduction des valeurs de l'énumération `Level` en arabe (`مبتدئ`, `متوسط`, etc.) dans `types.ts`.
  - Mise à jour du prompt API pour interdire explicitement l'ajout du nom du niveau dans le titre de la leçon.
  - Rétablissement de la grille à 4 colonnes sur le Dashboard.
- **Impact** : L'interface est 100% en arabe, le cursus est complet (4 niveaux), et les titres de leçons sont épurés.

### #19 - Intégration de la section Matn Officiel et Bibliothèque
**Date :** 2026-05-01
**Décision :** Ajout d'une section "Matn Officiel" certifiée dans les leçons et création d'une bibliothèque interactive.
**Justification :** Garantir que l'étudiant travaille sur des textes académiquement valides (statiques) plutôt que générés par l'IA.
**Impacts :** Modification de `constants.ts`, `Dashboard.tsx`, `LessonView.tsx` et création de `LibraryView.tsx`.
**Statut :** Terminé.

### #20 - Finalisation de la bibliothèque et lecture optimisée
**Date :** 2026-05-02
**Décision :** Finalisation de l'intégration du texte intégral d'Al-Akhdari et optimisation de l'UI du lecteur.
**Justification :** Offrir une source de vérité académique (Hifz) avec un confort de lecture maximal.
**Impacts :** 
- Suppression de la dépendance IA pour les textes sources.
- Taille de police réduite (xl/2xl) pour afficher plus de texte.
- Interlignage augmenté à 3 pour la clarté du tashkeel.
- Navigation bidirectionnelle Leçon <-> Bibliothèque opérationnelle.
**Statut :** Terminé (Ready for Push).

---  

## [2026-05-03] — Phase 8 : Déploiement Cloud (Vercel)

### 21. Synchronisation des Fonctions Serverless
- **Problème** : `api/generate-lesson.ts` ne bénéficiait pas des correctifs de robustesse du serveur local.
- **Solution** : Port du code de `api-server.ts` vers la fonction Vercel (Markdown stripping, parsing JSON flexible, split du contenu).
- **Dépendances** : Ajout de `@vercel/node` pour le support TypeScript natif sur Vercel.

**Statut Actuel** : 🚀 **Vercel Ready**.

### 22. Hotfix : Crash Supabase en Production (01:21)
- **Problème** : L'application crashe en production si les variables `VITE_SUPABASE_*` ne sont pas encore configurées sur Vercel.
- **Solution** : Initialisation conditionnelle de `supabase` (export `null` au lieu de crasher).
- **Impact** : L'app se charge correctement et utilise `localStorage` en attendant la configuration Supabase.

### 23. Robustesse de l'extraction JSON en Production (01:27)
- **Problème** : Erreurs 500 intermittentes dues à des réponses IA contenant du texte superflu autour du JSON.
- **Solution** : Passage d'un nettoyage par blocs markdown à une extraction par bornes `{ ... }`.
- **Impact** : Réduction drastique des erreurs de parsing JSON sur OpenRouter/Vercel.

### 24. Optimisation de la performance (Timeout Vercel) (01:31)
- **Problème** : Erreur 500 systématique en production due au timeout de 10s de Vercel Hobby (Gemini Pro trop lent).
- **Solution** : Passage au modèle `Gemini 2.0 Flash` pour l'API serverless.
- **Impact** : Réponses en < 5s, conformité avec les limites Vercel.
