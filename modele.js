/* Modèle de calcul du dossier Pathé : toutes les hypothèses au même endroit.
   Chaque valeur porte son statut (obs = observé, est = estimé, hyp = hypothèse) et sa source.
   Les pages « Coûts » et « Décision » lisent ce fichier : changer une valeur ici la change partout. */
const MODELE = {
  prixPlace:   { v: 13.50, statut: "obs", label: "Place plein tarif, Pathé Aubière", src: "https://www.allocine.fr/salle/cinema-P0956/tarifs/", date: "01/10/2026" },
  prixMenu:    { v: 8.50,  statut: "est", label: "Menu pop-corn + boisson vendu seul (prix de la formule UGC, faute de relevé chez Pathé)", src: "https://www.ugc.fr/comptoir.html", date: "08/10/2026" },
  tvaConf:     { v: 0.10,  statut: "obs", label: "TVA sur un produit vendu pour une consommation immédiate, y compris dans un cinéma", src: "https://entreprendre.service-public.gouv.fr/vosdroits/F22399", date: "vérifié le 03/12/2025" },
  tauxAchat:   { v: 23.013519 / 86.444020, statut: "obs", label: "Coût d'achat de la confiserie en % des ventes HT (achats 22 902 374 € + variation de stock 111 145 €) ÷ ventes 86 444 020 €, Pathé Cinémas France 2025", src: "docs/pathe-cinemas-france-comptes-2025.pdf#page=9", date: "comptes 2025" },
  // Coût du pack, ingrédient par ingrédient (pop-corn + boisson 50 cl, sans les autres confiseries)
  coutPopcorn: { v: 0.10, statut: "est", label: "Pop-corn : maïs 2 à 3 centimes, huile 2 à 3, sel ou sucre moins de 1, cornet carton environ 4, pour un grand sachet", src: "https://www.letribunaldunet.fr/argent/pourquoi-pop-corn-cinema-si-cher-vrai-cout.html", date: "Le Tribunal du Net, 03/06/2026" },
  siropBIB:    { v: 147.70, statut: "obs", label: "Sirop Coca-Cola post-mix, carton de 10 litres, prix hors TVA chez un grossiste", src: "https://www.foodsandgoods.nl/en/product/coca-cola-regular-post-mix-10-liters/", date: "Foods & Goods, consulté le 20/10/2026" },
  rendementBIB:{ v: 64, statut: "obs", label: "Litres de boisson obtenus avec 10 litres de sirop (rendement moyen annoncé)", src: "https://www.foodsandgoods.nl/en/product/coca-cola-regular-post-mix-10-liters/", date: "Foods & Goods, consulté le 20/10/2026" },
  gobelet:     { v: 107.03 / 1000, statut: "obs", label: "Gobelet carton 50 cl, carton de 1 000 à 107,03 € HT", src: "https://www.hellopro.fr/gobelet-50cl-carton-blanc-x1000-publiembal-blanc-7863577123953-2019015-16612113-produit.html", date: "Hellopro / Publiembal, consulté le 20/10/2026" },
  tvaPlace:    { v: 0.055, statut: "obs", label: "TVA sur les entrées de cinéma", src: "https://bofip.impots.gouv.fr/bofip/167-PGP.html/identifiant=BOI-TVA-LIQ-30-20-40-20200923", date: "BOFiP du 23/09/2020" },
  tsa:         { v: 0.1072, statut: "obs", label: "Taxe sur le prix des entrées (TSA), versée au CNC, en métropole", src: "https://www.assemblee-nationale.fr/dyn/16/questions/QANR5L16QE537", date: "réponse ministérielle du 11/10/2022" },
  location:    { v: 0.50,  statut: "obs", label: "Part de la recette hors taxes reversée au distributeur (fourchette légale 25 à 50 %, moyenne en métropole « avoisine les 50 % »)", src: "https://www.assemblee-nationale.fr/dyn/16/questions/QANR5L16QE537", date: "réponse ministérielle du 11/10/2022" },
  plafondCGR:  { v: 11.00, statut: "obs", label: "Place plein tarif, CGR Clermont-Ferrand Val Arena", src: "https://www.cgrcinemas.fr/cinema/p6310-cgr-clermont-ferrand-val-arena/", date: "08/10/2026" },
  prixTestes:  [16.90, 17.90, 18.90]
};

/* ---------- formules ---------- */
const ECO = {
  ht: (ttc, tva) => ttc / (1 + tva),
  // coût de la boisson 50 cl : sirop (prix ÷ rendement × 0,5 L, sans glace : estimation haute) + gobelet
  coutBoisson(m = MODELE) { return m.siropBIB.v / m.rendementBIB.v * 0.5 + m.gobelet.v; },
  // coût variable d'un menu pop-corn + boisson, ingrédient par ingrédient
  coutMenu(m = MODELE) { return m.coutPopcorn.v + ECO.coutBoisson(m); },
  // comparaison : coût moyen si l'on applique le taux d'achat de toute la confiserie de Pathé (borne haute)
  coutMenuMoyen(m = MODELE) { return m.tauxAchat.v * ECO.ht(m.prixMenu.v, m.tvaConf.v); },
  // Hypothèse de ventilation : la place reste déclarée à son plein tarif, la remise porte sur la confiserie
  confDansPack(prix, m = MODELE) { return prix - m.prixPlace.v; },
  // Client A : prenait la place seule, passe au pack → gagne la confiserie vendue dans le pack, moins son coût
  gainA(prix, m = MODELE) { return ECO.ht(ECO.confDansPack(prix, m), m.tvaConf.v) - ECO.coutMenu(m); },
  // Client B : prenait déjà place + menu, passe au pack → perd la remise (HT), le coût des produits ne change pas
  perteB(prix, m = MODELE) { return ECO.ht(m.prixMenu.v - ECO.confDansPack(prix, m), m.tvaConf.v); },
  // Combien de clients A faut-il pour compenser un client B ?
  ratio(prix, m = MODELE) { const g = ECO.gainA(prix, m); return g > 0 ? ECO.perteB(prix, m) / g : Infinity; },
  // Prix plancher : le pack ne rapporte rien même sur un client A
  plancher(m = MODELE) { return m.prixPlace.v + ECO.coutMenu(m) * (1 + m.tvaConf.v); },
  // Ce qu'il reste à Pathé sur une place, après TVA, TSA et part du distributeur
  place(m = MODELE) {
    const ht = ECO.ht(m.prixPlace.v, m.tvaPlace.v);
    const tsa = ht * m.tsa.v;
    const recetteHT = ht - tsa;
    const distrib = recetteHT * m.location.v;
    return { ttc: m.prixPlace.v, tva: m.prixPlace.v - ht, ht, tsa, recetteHT, distrib, reste: recetteHT - distrib };
  }
};

/* ---------- décision : marge du pack pour 100 spectateurs, à partir des réponses ----------
   marge = 100 × [part A × acceptation A × gain A − part B × acceptation B × perte B]
   options du stress test : cout (multiplicateur du coût), reel (part de l'acceptation déclarée des clients A qui se réalise),
   menu (prix du menu vendu seul), dB (points de part de clients B en plus) */
const DECISION = {
  groupes(rows) {
    const D = rows.filter(r => !/test/i.test(r.situation_autre || "") && !/test/i.test(r.plateformes_autre || ""));
    return { D, A: D.filter(r => r.type_client === "A_sans_confiserie"), B: D.filter(r => r.type_client === "B_avec_confiserie") };
  },
  acc(g, p) { const c = "gg_" + p.toFixed(2).replace(".", "_"); return g.length ? g.filter(r => DONNEES.num(r[c]) === 1).length / g.length : 0; },
  /* Version par répondant, fondée sur la dépense déclarée (question 11) plutôt que sur un menu supposé à 8,50 € :
     pour chaque répondant qui accepte le pack au prix p,
     variation de marge = (confiserie du pack HT − coût du menu) − marge qu'il laissait déjà en confiserie
                        = gainA(p) − dépense déclarée HT × (1 − taux d'achat).
     Les dépenses déclarées > 50 € sont signalées et exclues. Moyenne sur tous les répondants retenus, × 100. */
  retenus(G) { return G.D.filter(r => { const d = DONNEES.num(r.depense); return d != null && d <= 50; }); },
  delta(r, p, m) { const d = DONNEES.num(r.depense); return ECO.gainA(p, m) - ECO.ht(d, m.tvaConf.v) * (1 - m.tauxAchat.v); },
  marge(G, p, o = {}) {
    const R = DECISION.retenus(G); if (!R.length) return null;
    const m = JSON.parse(JSON.stringify(MODELE));
    if (o.cout) m.tauxAchat.v *= o.cout;
    if (o.menu) m.prixMenu.v = o.menu;
    const c = "gg_" + p.toFixed(2).replace(".", "_");
    const isB = r => r.type_client === "B_avec_confiserie", nB = R.filter(isB).length, nA = R.length - nB;
    // poids du scénario « du pire » : la part de clients B gagne dB points
    const sb = nB / R.length, sb2 = Math.min(1, sb + (o.dB ?? 0)), wB = nB ? sb2 / sb : 1, wA = nA ? (1 - sb2) / (1 - sb) : 1;
    let s = 0;
    for (const r of R) {
      if (DONNEES.num(r[c]) !== 1) continue;
      // reel : seule une partie des clients qui n'achetaient pas de confiserie passe vraiment au pack ; les clients B, qui y gagnent, le prennent comme déclaré
      const k = isB(r) ? wB : wA * (o.reel ?? 1);
      s += k * DECISION.delta(r, p, m);
    }
    return 100 * s / R.length;
  },
  meilleur(G) { return MODELE.prixTestes.map(p => ({ p, m: DECISION.marge(G, p) })).reduce((a, b) => (b.m > a.m ? b : a)); }
};

/* ---------- mise en forme ---------- */
const FMT = {
  e: (v, d = 2) => (v < 0 ? "−" : "") + Math.abs(v).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }) + " €",
  n: (v, d = 1) => (v < 0 ? "−" : "") + Math.abs(v).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }),
  p: (v, d = 1) => (v * 100).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }) + " %",
  tag: s => ({ obs: '<span class="tag obs">Observé</span>', est: '<span class="tag est">Estimé</span>', hyp: '<span class="tag hyp">Hypothèse</span>', miss: '<span class="tag miss">À fournir</span>' })[s] || ""
};

/* ---------- réponses au questionnaire ----------
   Le fichier data/reponses.csv est l'export brut de l'onglet « reponses » de la feuille Google Sheets
   (Fichier › Télécharger › CSV). Rien n'est saisi à la main : tous les résultats sont recalculés à partir de ce fichier. */
const DONNEES = {
  url: new URLSearchParams(location.search).get("donnees") || "data/reponses.csv",
  parse(text) {
    const rows = []; let row = [], cell = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
      else if (c === '"') q = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
      else cell += c;
    }
    if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
    const head = rows.shift().map(h => h.trim());
    return rows.filter(r => r.some(x => x.trim() !== "")).map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? "").trim()])));
  },
  num(v) { if (v == null || v === "") return null; const x = Number(String(v).replace(/\s/g, "").replace(",", ".")); return Number.isFinite(x) ? x : null; },
  async charger() {
    const r = await fetch(DONNEES.url, { cache: "no-store" });
    if (!r.ok) return null;
    return DONNEES.parse(await r.text());
  }
};
