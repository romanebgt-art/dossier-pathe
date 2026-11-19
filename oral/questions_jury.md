# Les 8 questions les plus probables du jury

Réponses courtes, à dire en 30 secondes, chacune appuyée sur un calcul de `calculs.md` (numéro de section entre parenthèses). Le cours prévient : chacun répond sur ses propres chiffres, et « c'est l'IA qui l'a fait » n'est pas une réponse.

---

### 1. « Votre menu à 8,50 €, d'où vient-il ? Il porte tout votre raisonnement. »

C'est la formule confiserie d'UGC ([ugc.fr](https://www.ugc.fr/comptoir.html), 20/10/2026), parce que ni Pathé ni CGR ne publient leurs prix de comptoir. C'est notre hypothèse la plus fragile, et nous l'avons testée : à 7,50 €, il faut 2,1 clients « place seule » pour compenser un client qui prenait déjà le menu ; à 9,50 €, il en faut 3,2. Dans tous les cas, notre échantillon n'en convertit que 0,45 (5.3 et 5.5). La conclusion tient, mais c'est le premier chiffre que nous relèverions en caisse.

### 2. « Pathé perd de l'argent : pourquoi ne pas simplement baisser le prix des places ? »

Parce que la billetterie est la moins rentable : il reste 0,49 € à Pathé par euro de place, contre 0,73 € par euro de confiserie (1.3 et 1.4). Avec une marge nette de −5,4 % et six jours de trésorerie (1.5 et 1.7), toute baisse de prix sans hausse des volumes tombe directement sur le résultat, comme le montre le CM 1.

### 3. « Votre échantillon est-il représentatif ? »

Non, et nous le disons : 119 répondants, échantillon de convenance, 61 % d'étudiants (4.1). Nos résultats décrivent une clientèle jeune au petit budget. En revanche, le test A/B reste valable à l'intérieur de l'échantillon, puisque le hasard a réparti les versions A et B. La marge d'erreur est d'environ ±9 points sur une proportion (4.2).

### 4. « Votre test A/B ne montre rien de significatif : à quoi a-t-il servi ? »

Il montre une tendance : la version avec « 22 € » fait mieux à chaque prix (+12, +12 et +10 points). Mais p = 0,186 : l'écart peut venir du hasard. Pour le prouver, il faudrait environ 261 répondants par version, contre 65 et 54 (4.3). Comme la mention ne coûte presque rien, nous recommandons quand même de l'afficher, sans prétendre que l'effet est prouvé.

### 5. « Pourquoi parler de perte alors que 47 % des gens achèteraient le pack ? »

Parce que l'important n'est pas combien achètent, mais qui achète. Parmi les acheteurs à 16,90 €, 38 achetaient déjà de la confiserie et 17 seulement prenaient la place seule (4.4). Chaque client qui prenait déjà le menu fait perdre 4,64 € à Pathé ; chaque client converti n'en rapporte que 1,73 € (3.5). Résultat : −178 € pour 100 spectateurs (5.1).

### 6. « Quel est votre seuil de rentabilité ? »

Le seuil du cours (coûts fixes ÷ contribution marginale) est quasi nul, car le pack n'a presque pas de coût fixe. Notre point de rupture est le mélange de clients : à 16,90 €, il faut 2,7 clients « place seule » convertis pour compenser 1 client qui prenait déjà le menu (5.3). Et pour l'acheteur médian, le pack ne cesse de perdre de l'argent qu'à 20,87 €, au-dessus du plafond de 19,50 € (5.2).

### 7. « À quel moment votre scénario lâche-t-il ? »

Les scénarios « plus dur » et « du pire » restent négatifs (5.4). Ce qui peut le renverser, c'est la fréquentation : si le pack fait venir les gens plus souvent, il suffit de 24 séances de plus pour 100 spectateurs à 16,90 €, et de 4 à 18,90 € (5.5). Nous ne l'avons pas mesuré : c'est la limite principale de notre étude et la question à poser en premier dans un test en salle.

### 8. « Comment avez-vous calculé ce qu'il reste à Pathé sur une place ? »

13,50 € ÷ 1,055 pour retirer la TVA à 5,5 % = 12,80 € ; moins la taxe CNC de 10,72 % = 11,42 € ; moins 50 % pour le distributeur = 5,71 € (3.2). Les taux viennent du BOFiP et d'une réponse ministérielle de 2022. Recoupement : la ligne des comptes qui correspond très probablement à la location des films représente 50,6 % de la billetterie (1.4).

---

## Questions de réserve

- **« Pourquoi Gabor-Granger plutôt que Van Westendorp ? »** Nous voulions une part d'acheteurs à des prix précis, sous le plafond, pour la convertir en marge. Le CM 2 accepte les deux, à condition de dire ce qu'on mesure.
- **« Pourquoi un test t unilatéral ? »** Le sens de la question (« les étudiants dépensent-ils moins ? ») était fixé avant le calcul. En bilatéral, p = 0,012 : la conclusion est la même.
- **« Votre régression a un R² de 99,9 % : c'est solide ? »** Non : 3 points seulement, donnés par les mêmes personnes. Elle décrit la baisse (−19 points par euro) entre 16,90 et 18,90 €, sans prévoir au-delà. La preuve de l'effet du prix est le Q de Cochran (p < 0,001).
