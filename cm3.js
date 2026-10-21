/* Analyse CM3 : les mêmes tests que les scripts du cours (github.com/VincentFavarin/analyse-projet-prix),
   recalculés dans le navigateur à partir de data/reponses.csv. Rien n'est saisi à la main.
   Correspondances : nettoyer() → outils.py ; welch(), chi2(), puissance() → 03_test_ab.py ;
   gabor_granger() → 04_prix.py ; alpha, CR, AVE → 05_echelles.py ; mediation_bootstrap() → PROCESS modèle 4. */
const STAT = {
  // log gamma (Lanczos)
  lgamma(x) {
    const g = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61503916999185, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - STAT.lgamma(1 - x);
    x -= 1; let a = 0.99999999999980993; const t = x + 7.5;
    for (let i = 0; i < 8; i++) a += g[i] / (x + i + 1);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  },
  // gamma incomplète régularisée P(a, x)
  gammaP(a, x) {
    if (x <= 0) return 0;
    if (x < a + 1) { let s = 1 / a, t = s; for (let n = 1; n < 500; n++) { t *= x / (a + n); s += t; if (Math.abs(t) < 1e-15 * s) break; } return s * Math.exp(-x + a * Math.log(x) - STAT.lgamma(a)); }
    let b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
    for (let i = 1; i < 500; i++) { const an = -i * (i - a); b += 2; d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300; c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-15) break; }
    return 1 - Math.exp(-x + a * Math.log(x) - STAT.lgamma(a)) * h;
  },
  chi2p: (x, k) => 1 - STAT.gammaP(k / 2, x / 2),
  // bêta incomplète régularisée I_x(a, b)
  betaI(x, a, b) {
    if (x <= 0) return 0; if (x >= 1) return 1;
    const bt = Math.exp(STAT.lgamma(a + b) - STAT.lgamma(a) - STAT.lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    const cf = (x, a, b) => { let c = 1, d = 1 - (a + b) * x / (a + 1); d = 1 / d; let h = d;
      for (let m = 1; m < 300; m++) { const m2 = 2 * m; let aa = m * (b - m) * x / ((a + m2 - 1) * (a + m2)); d = 1 + aa * d; d = 1 / d; c = 1 + aa / c; h *= d * c;
        aa = -(a + m) * (a + b + m) * x / ((a + m2) * (a + m2 + 1)); d = 1 + aa * d; d = 1 / d; c = 1 + aa / c; const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-14) break; } return h; };
    return x < (a + 1) / (a + b + 2) ? bt * cf(x, a, b) / a : 1 - bt * cf(1 - x, b, a) / b;
  },
  tp2: (t, df) => STAT.betaI(df / (df + t * t), df / 2, 0.5),          // p bilatéral d'un t de Student
  tcrit(df, alpha = 0.05) { let lo = 0, hi = 50; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; STAT.tp2(m, df) > alpha ? lo = m : hi = m; } return (lo + hi) / 2; },
  phi: z => 0.5 * (1 + STAT.erf(z / Math.SQRT2)),
  erf(x) { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x);
    return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)); },
  mean: a => a.reduce((s, x) => s + x, 0) / a.length,
  var(a) { const m = STAT.mean(a); return a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1); },
  median(a) { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; },
  // test de Welch + d de Cohen (écart-type moyen des deux groupes, comme d_cohen() du cours)
  welch(a, b) {
    const ma = STAT.mean(a), mb = STAT.mean(b), va = STAT.var(a), vb = STAT.var(b), na = a.length, nb = b.length;
    const se = Math.sqrt(va / na + vb / nb), t = (ma - mb) / se;
    const df = (va / na + vb / nb) ** 2 / ((va / na) ** 2 / (na - 1) + (vb / nb) ** 2 / (nb - 1));
    return { ma, mb, va, vb, na, nb, t, df, p: STAT.tp2(t, df), d: (ma - mb) / Math.sqrt((va + vb) / 2) };
  },
  // chi² d'indépendance sur un tableau de contingence (lignes = versions) ; yates : correction de continuité (2 × 2)
  chi2(tab, yates = false) {
    const R = tab.map(r => r.reduce((s, x) => s + x, 0)), Cc = tab[0].map((_, j) => tab.reduce((s, r) => s + r[j], 0)), N = R.reduce((s, x) => s + x, 0);
    let k = 0, petit = false;
    tab.forEach((r, i) => r.forEach((o, j) => { const e = R[i] * Cc[j] / N; if (e < 5) petit = true; let dlt = Math.abs(o - e); if (yates) dlt = Math.max(0, dlt - 0.5); k += dlt * dlt / e; }));
    const ddl = (tab.length - 1) * (Cc.length - 1);
    return { chi2: k, ddl, p: STAT.chi2p(k, ddl), v: Math.sqrt(k / (N * (Math.min(tab.length, Cc.length) - 1))), petit, N };
  },
  // puissance d'un test t à deux groupes (loi de Student non centrée, comme TTestIndPower de statsmodels), seuil 5 %
  puissance(na, nb, d) {
    const df = na + nb - 2, ncp = d * Math.sqrt(na * nb / (na + nb)), tc = STAT.tcrit(df);
    // T' = (Z + ncp) / sqrt(V / df), V ~ chi²(df) : on intègre sur V
    const lf = df / 2 * Math.log(0.5) - STAT.lgamma(df / 2);
    const dens = v => Math.exp(lf + (df / 2 - 1) * Math.log(v) - v / 2);
    const hi = df + 12 * Math.sqrt(2 * df), n = 4000, h = hi / n; let s = 0;
    for (let i = 1; i < n; i++) { const v = i * h, w = i % 2 ? 4 : 2, q = tc * Math.sqrt(v / df); s += w * dens(v) * ((1 - STAT.phi(q - ncp)) + STAT.phi(-q - ncp)); }
    return s * h / 3;
  },
  alpha(items) { // items : tableau de colonnes
    const k = items.length, tot = items[0].map((_, i) => items.reduce((s, c) => s + c[i], 0));
    return k / (k - 1) * (1 - items.reduce((s, c) => s + STAT.var(c), 0) / STAT.var(tot));
  },
  corr(x, y) { const mx = STAT.mean(x), my = STAT.mean(y); let a = 0, b = 0, c = 0; for (let i = 0; i < x.length; i++) { a += (x[i] - mx) * (y[i] - my); b += (x[i] - mx) ** 2; c += (y[i] - my) ** 2; } return a / Math.sqrt(b * c); },
  // moindres carrés : coefficients de y sur [1, X...]
  ols(cols, y) {
    const n = y.length, X = y.map((_, i) => [1, ...cols.map(c => c[i])]), k = X[0].length;
    const A = Array.from({ length: k }, (_, i) => Array.from({ length: k + 1 }, (_, j) => j < k ? X.reduce((s, r) => s + r[i] * r[j], 0) : X.reduce((s, r, t) => s + r[i] * y[t], 0)));
    for (let i = 0; i < k; i++) { let p = i; for (let r = i + 1; r < k; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r; [A[i], A[p]] = [A[p], A[i]];
      for (let r = 0; r < k; r++) if (r !== i) { const f = A[r][i] / A[i][i]; for (let c = i; c <= k; c++) A[r][c] -= f * A[i][c]; } }
    return A.map((r, i) => r[k] / r[i]);
  },
  rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; },
  pct(a, q) { const s = [...a].sort((x, y) => x - y), i = (s.length - 1) * q, lo = Math.floor(i); return s[lo] + (s[Math.ceil(i)] - s[lo]) * (i - lo); },
  // médiation simple (PROCESS modèle 4) : a = X → M, b = M → Y à X constant, IC 95 % percentile par bootstrap
  mediation(X, M, Y, n = 5000, graine = 2026) {
    const co = (X, M, Y) => { const a = STAT.ols([X], M)[1], cb = STAT.ols([X, M], Y); return { a, b: cb[2], direct: cb[1] }; };
    const r = co(X, M, Y), tot = STAT.ols([X], Y)[1], rnd = STAT.rng(graine), ab = [], bs = [], as = [], N = X.length;
    for (let t = 0; t < n; t++) { const ix = Array.from({ length: N }, () => Math.floor(rnd() * N)); const c = co(ix.map(i => X[i]), ix.map(i => M[i]), ix.map(i => Y[i])); ab.push(c.a * c.b); as.push(c.a); bs.push(c.b); }
    return { ...r, ab: r.a * r.b, total: tot, bas: STAT.pct(ab, 0.025), haut: STAT.pct(ab, 0.975),
      icA: [STAT.pct(as, 0.025), STAT.pct(as, 0.975)], icB: [STAT.pct(bs, 0.025), STAT.pct(bs, 0.975)], n: N, tirages: n };
  }
};

const CM3 = {
  VERSIONS: { A: "A (sans prix de référence)", B: "B (avec « 22 € séparément »)" },
  GG: { 16.90: "gg_16_90", 17.90: "gg_17_90", 18.90: "gg_18_90" },
  VP: ["vp_bonne_affaire", "vp_prix_acceptable", "vp_qualite_prix"],
  // 01 : nettoyage, avec la trace de chaque retrait
  nettoyer(rows) {
    let d = rows; const journal = [["Réponses reçues", 0, d.length]];
    const etape = (retirer, raison) => { const m = d.map(retirer), n = m.filter(Boolean).length; d = d.filter((_, i) => !m[i]); journal.push([raison, n, d.length]); };
    const vus = new Set(); etape(r => { const dup = vus.has(r.id); vus.add(r.id); return dup; }, "doublons (même identifiant)");
    etape(r => /test/i.test(r.situation_autre || "") || /test/i.test(r.plateformes_autre || ""), "réponses de test de l'équipe");
    etape(r => { const o = Object.keys(CM3.GG).sort().map(p => DONNEES.num(r[CM3.GG[p]]) === 1 ? 1 : 0); return o.some((v, i) => i && v > o[i - 1]); }, "Gabor-Granger : accepte un prix plus haut qu'un prix refusé");
    // signalés, gardés (le cours : on ne supprime pas en silence)
    const signal = { depense: d.filter(r => (DONNEES.num(r.depense) ?? 0) > 50).length, rapide: d.filter(r => (DONNEES.num(r.duree_sec) ?? 999) < 60).length };
    return { d, journal, signal };
  },
  par: (d, v) => d.filter(r => r.version === v),
  vp: r => { const x = CM3.VP.map(c => DONNEES.num(r[c])); return x.some(v => v == null) ? null : STAT.mean(x); },
  nbAcc: r => Object.values(CM3.GG).reduce((s, c) => s + (DONNEES.num(r[c]) === 1 ? 1 : 0), 0),
  tableau(d, col, mod) { return ["A", "B"].map(v => mod.map(m => CM3.par(d, v).filter(r => (r[col] || "") === m).length)); },
  analyser(rows) {
    const { d, journal, signal } = CM3.nettoyer(rows), A = CM3.par(d, "A"), B = CM3.par(d, "B"), out = { d, journal, signal, nA: A.length, nB: B.length };
    // tirage au sort : les deux groupes se ressemblent-ils ? (chi², correction de Yates en 2 × 2 comme scipy par défaut)
    out.tirage = [["situation", "Situation"], ["cinema", "Cinéma habituel"], ["type_client", "Achète de la confiserie"], ["derniere_seance", "Dernière séance"]].map(([c, l]) => {
      const mod = [...new Set(d.map(r => r[c] || ""))].filter(m => m !== "").sort(), t = CM3.tableau(d, c, mod);
      return { col: c, libelle: l, mod, t, ...STAT.chi2(t, mod.length === 2) };
    });
    out.tirage.push({ col: "duree_sec", libelle: "Durée de réponse (s)", ...STAT.welch(A.map(r => DONNEES.num(r.duree_sec)).filter(x => x != null), B.map(r => DONNEES.num(r.duree_sec)).filter(x => x != null)) });
    // test A/B : variables oui/non → chi² + V de Cramer ; variables chiffrées → Welch + d de Cohen
    out.ab = Object.entries(CM3.GG).map(([p, c]) => {
      const t = ["A", "B"].map(v => { const g = CM3.par(d, v), o = g.filter(r => DONNEES.num(r[c]) === 1).length; return [g.length - o, o]; });
      return { prix: +p, partA: t[0][1] / (t[0][0] + t[0][1]), partB: t[1][1] / (t[1][0] + t[1][1]), t, ...STAT.chi2(t) };
    });
    // la question 8 affichait 18,90 € jusqu'au 15/10, puis 16,90 € : on compare A et B à prix affiché égal (16,90 €)
    const a169 = r => DONNEES.num(r.prix_pack_affiche) === 16.9;
    out.n169 = d.filter(a169).length;
    out.welchVP = STAT.welch(A.filter(a169).map(CM3.vp).filter(x => x != null), B.filter(a169).map(CM3.vp).filter(x => x != null));
    out.welchNb = STAT.welch(A.map(CM3.nbAcc), B.map(CM3.nbAcc));
    out.puiss = { moyen: STAT.puissance(A.length, B.length, 0.5), petit: STAT.puissance(A.length, B.length, 0.2) };
    // Gabor-Granger façon 04_prix.py : marge par répondant = (prix − coût variable) × part qui achète
    // + la marge réellement gagnée par répondant une fois retirée la confiserie que l'acheteur payait déjà (page « La décision »)
    const cv = CM3.coutVariable, G = DECISION.groupes(d);
    out.gg = Object.entries(CM3.GG).map(([p, c]) => { const taux = d.filter(r => DONNEES.num(r[c]) === 1).length / d.length; return { prix: +p, taux, ca: +p * taux, marge: (+p - cv(+p)) * taux, cv: cv(+p), incr: DECISION.marge(G, +p) / 100 }; });
    const ach = d.filter(r => DONNEES.num(r.gg_16_90) === 1 && r.type_client);
    out.partBacheteurs = ach.filter(r => r.type_client === "B_avec_confiserie").length / ach.length;
    // échelle de valeur perçue (Dodds et al., 1991, 3 items)
    const S = d.filter(r => CM3.vp(r) != null), cols = CM3.VP.map(c => S.map(r => DONNEES.num(r[c])));
    const r12 = STAT.corr(cols[0], cols[1]), r13 = STAT.corr(cols[0], cols[2]), r23 = STAT.corr(cols[1], cols[2]);
    // 3 items, 1 facteur : modèle juste identifié (0 ddl), poids standardisés tirés des corrélations
    const l = [Math.sqrt(r12 * r13 / r23), Math.sqrt(r12 * r23 / r13), Math.sqrt(r13 * r23 / r12)], sl = l.reduce((s, x) => s + x, 0);
    out.echelle = { n: S.length, alpha: STAT.alpha(cols), r: [r12, r13, r23], poids: l, cr: sl ** 2 / (sl ** 2 + l.reduce((s, x) => s + 1 - x * x, 0)), ave: STAT.mean(l.map(x => x * x)),
      moyennes: cols.map(STAT.mean) };
    // médiation : version (B = 1) → valeur perçue → achète à 16,90 €
    const M = d.filter(r => CM3.vp(r) != null && a169(r));
    out.med = STAT.mediation(M.map(r => r.version === "B" ? 1 : 0), M.map(CM3.vp), M.map(r => DONNEES.num(r.gg_16_90) === 1 ? 1 : 0));
    out.medNb = STAT.mediation(M.map(r => r.version === "B" ? 1 : 0), M.map(CM3.vp), M.map(CM3.nbAcc));
    return out;
  },
  // coût variable d'un pack pour Pathé (par pack vendu, hors cannibalisation) :
  // TVA, TSA et part du distributeur sur la place + TVA sur la confiserie + coût du pop-corn et de la boisson
  coutVariable(p) { const pl = ECO.place(); return pl.tva + pl.tsa + pl.distrib + (ECO.confDansPack(p) - ECO.ht(ECO.confDansPack(p), MODELE.tvaConf.v)) + ECO.coutMenu(); }
};
