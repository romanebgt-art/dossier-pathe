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
    // test 3 : dépense (question 11) × valeur perçue (question 8, moyenne des 3 phrases), pack affiché à 16,90 € à la question 8
    corr: { n: 114, r: 0.440886, mx: 5.4614, my: 3.193, sx: 5.645, sy: 1.0131,
      // nombre de répondants par couple (dépense en €, note × 3) : un tableau de fréquences, pas des réponses individuelles
      cells: [[0,3,6],[0,4,1],[0,5,1],[0,6,3],[0,7,1],[0,8,5],[0,9,11],[0,10,5],[0,11,1],[0,12,5],[0,13,2],[2,11,1],[3,4,1],[3,9,1],[4,6,1],[4,7,1],[5,5,1],[5,6,2],[5,7,1],[5,8,1],[5,10,3],[5,11,4],[5,12,3],[5,13,1],[6,6,2],[6,7,2],[6,10,2],[6,12,4],[6,15,1],[7,3,1],[7,10,2],[7,11,1],[8,6,1],[8,8,2],[8,9,2],[8,11,1],[8,12,4],[8,13,2],[8,14,1],[9.6,11,1],[10,7,1],[10,8,2],[10,9,1],[10,12,5],[10,15,1],[12,10,1],[12,12,1],[12,13,1],[15,7,1],[15,12,2],[15,15,3],[18,12,1],[20,12,1],[25,15,1],[30,12,1]],
      cl: [{ l: "0 €", n: 41, vp: 2.748 }, { l: "1 à 5 €", n: 21, vp: 3.0476 }, { l: "6 à 10 €", n: 39, vp: 3.4188 }, { l: "plus de 10 €", n: 13, vp: 4.1538 }] }
  } };
