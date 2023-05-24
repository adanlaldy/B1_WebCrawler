const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('assets/css'));

const port = 3000;
app.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});

app.get('/', (req, res) => {
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
    const models = await page.$$('div.product-tile__info .product-tile__model');
    const prices = await page.$$('div.product-tile__info .product-tile__price .price');
    const imgs = await page.$$('div.product-tile .product-tile__figure');

    console.log("models: ", models);
    console.log("prices: ", prices);
    console.log("imgs: ", imgs);

    let watchesInfo = [];

    // Initialize length of watchesInfo
    for (const _ of models) {
      watchesInfo.push({
        "model": "",
        "price": "",
        "img": "",
      })
    }

    // Recupère les éléments
    for (let i = 0; i < models.length; i++) {
      watchesInfo[i].model = await page.evaluate(el => el.innerHTML, models[i]);
      watchesInfo[i].price = await page.evaluate(el => el.innerHTML, prices[i]);
      watchesInfo[i].img = await page.evaluate(el => el.innerHTML, imgs[i]);
    }

    let result = `
    <html>
    <head>
        <title>Scrapper PRO</title>
        <link rel="stylesheet" type="text/css" href="assets/css/main.css">
    </head>
    <body>
        <div class="head">
            <h1>Scrapper PRO</h1>
            <hr>
        </div>
    `;

    for (const watcheInfo of watchesInfo) {
      result += `
      <div class="watch-info">
        <div class="watch-model">
            ${watcheInfo.model}
        </div>
        <div class="watch-price">
            ${watcheInfo.price}
        </div>
      </div>
      <div class="watch-image">
        ${watcheInfo.img}
      </div>
      `;
    }

    result += `
        <div class="end">
            <hr>
            <h1>Scrapper PRO</h1>
        </div>
    </body>
    </html>
    `;

    // Envoyer le contenu de l'élément dans la réponse
    res.send(result);

  } catch (error) {
    console.error(error);
    res.status(500).send(`
    <div>
      <h1>Erreur lors du crawling</h1>
    </div>
    `);
  }
});
