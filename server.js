const puppeteer = require('puppeteer');
const express = require('express');
const app = express();

app.get('/', async (req, res) => {
  // Lancer le navigateur
  const browser = await puppeteer.launch();

  // Créer une page
  const page = await browser.newPage();

  // Accéder à votre site
  await page.goto('https://www.omegawatches.com/fr-fr/watches/constellation/globemaster/catalog');

  // Rechercher les éléments spécifiques
  const elements = await page.$$('ol#product-list-grid .product-item');
  let elementContent = "";
  for (const item of elements) {
    elementContent += await page.evaluate(el => el.innerHTML, item);
  }

  // Fermer le navigateur
  await browser.close();

  // Envoyer le contenu des éléments dans la réponse
  res.send(elementContent);
});

//plus qu'à récup les images

const port = 3000;
app.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
  console.log("http://localhost:3000/");
});
