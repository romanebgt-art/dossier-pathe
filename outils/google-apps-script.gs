/**
 * Enregistrement des réponses du questionnaire dans Google Sheets.
 *
 * Installation (une seule fois) :
 * 1. Créer une feuille Google Sheets vide (par exemple « Questionnaire pack Pathé »).
 * 2. Menu Extensions > Apps Script, effacer le contenu et coller ce fichier.
 * 3. Enregistrer, puis Déployer > Nouveau déploiement > type « Application Web ».
 *    - Exécuter en tant que : Moi
 *    - Qui a accès : Tout le monde
 * 4. Autoriser l'accès quand Google le demande, puis copier l'URL de l'application Web
 *    (elle se termine par /exec).
 * 5. Coller cette URL dans questionnaire.html, dans CONFIG.ENDPOINT.
 *
 * La première réponse crée la ligne d'en-tête ; ensuite, une ligne par répondant.
 * Aucune adresse IP ni aucun e-mail ne sont enregistrés.
 */
const SHEET_NAME = "reponses";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const row = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    let headers = [];
    if (sheet.getLastRow() > 0) {
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    } else {
      headers = Object.keys(row);
      sheet.appendRow(headers);
    }
    sheet.appendRow(headers.map(function (h) { return row[h] === undefined ? "" : row[h]; }));
    return ContentService.createTextOutput("ok");
  } finally {
    lock.releaseLock();
  }
}

// Permet de vérifier dans le navigateur que l'application répond.
function doGet() {
  return ContentService.createTextOutput("Le questionnaire est bien relié à la feuille.");
}
