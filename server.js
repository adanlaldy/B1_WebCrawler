const puppeteer = require('puppeteer');
const express = require('express');
const app = express();

const port = 3000;
app.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});

app.get('/', (req, res) => {
    res.sendFile('/home/voluxyy/Fichier/Gitea/WebCrawler/assets/html/main.html');
  });

app.get('/crawl', async (req, res) => {
  try {
    // Lancer le navigateur
    const browser = await puppeteer.launch({
      headless: "new",
    });

    // Créer une page
    const page = await browser.newPage();

    // Accéder à votre site
    await page.goto('https://www.chronext.fr/rolex');

    const selector = '.product-tile';

    // Attendre que la liste soit chargée
    await page.waitForSelector(selector);

    // Recupère la liste
    const elements = await page.$$(selector);
    const watches = [];

    // Recupère les éléments
    for (const element of elements) {
      const nameElem = await element.$('.product-tile__model');
      const priceElem = await element.$('.product-tile__price');

      const name = page.evaluate(el => el.textContent, nameElem);
      const price = page.evaluate(el => el.textContent, priceElem);

      watches.push({
        "name": name,
        "price": price,
      });
    }

    // Fermer le navigateur
    await browser.close();

    // Envoyer le contenu de l'élément dans la réponse
    res.send(
        `<div>
          <h1>${watches[0].name}</h1>
          <h2>${watches[0].price}</h2>
        </div>`
    );

  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors du crawling');
  }
});
