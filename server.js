const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');
const app = express();

const port = 3000;
app.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});

app.get('/', (req, res) => {
  // Chemin linux : '/home/voluxyy/Fichier/Gitea/WebCrawler/assets/html/main.html'
  // Chemin windows : 'E:\Fichier\Travail\Gitea\WebCrawler\assets\html\main.html'
    res.sendFile(path.join(__dirname, 'assets', 'html', 'main.html'));
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

    // Recupère la liste
    const elements = await page.$$('div.product-list .product-tile .product-tile__info');

    let watchesInfo = [];

    // Recupère les éléments
    for (const element of elements) {
      watchesInfo.push(await page.evaluate(el => el.innerHTML, element));
    }

    // Envoyer le contenu de l'élément dans la réponse
    res.send(watchesInfo[0]);

  } catch (error) {
    console.error(error);
    res.status(500).send(`
    <div>
      <h1>Erreur lors du crawling</h1>
    </div>
    `);
  }
});
