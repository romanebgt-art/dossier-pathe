/* Résultats agrégés des réponses au questionnaire (export du 21/10/2026, 119 réponses).
   Les réponses individuelles restent hors ligne, comme le demande le cours (séance CM3).
   stats : effectifs utilisés par statistiques.html quand data/reponses.csv est absent (site en ligne).
   Pour chaque groupe : [effectif, oui à 16,90 €, oui à 17,90 €, oui à 18,90 €]. */
window.AGREGATS = { date: "21/10/2026", reponses: 119, prixMax: { med: 17.9, n: 56, refus: 63 },
  stats: {
    n: 119, oui: [56, 32, 11],
    confiserie: { oui: [59, 38, 18, 8], non: [58, 17, 14, 3] },
    situation: { etudiant: [72, 33, 16, 7], actif: [40, 22, 15, 4] },
    // test A/B : version A (sans prix de référence) / version B (avec « achetés séparément : 22 € »)
    version: { A: [65, 27, 14, 3], B: [54, 29, 18, 8] },
    // test 2 : dépense en confiserie par séance (question 11), réponses au-dessus de 50 € écartées
    student: { etudiant: { n: 72, m: 4.619444, v: 19.7568, zero: 28 }, actif: { n: 39, m: 7.769231, v: 47.287449, zero: 8 }, ecartees: 1, mwp: 0.020925 },
    // test 3 : dépense (question 11) × valeur perçue (question 8, moyenne des 3 phrases)
    corr: { n: 118, r: 0.407894, cl: [{ l: "0 €", n: 43, vp: 2.8217 }, { l: "1 à 5 €", n: 22, vp: 3.0909 }, { l: "6 à 10 €", n: 40, vp: 3.4 }, { l: "plus de 10 €", n: 13, vp: 4.1538 }] }
  } };
