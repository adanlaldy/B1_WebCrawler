const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('assets/css'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'assets', 'template'));

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

    await page.waitForSelector()

    // .product-tile__info
    // .product-tile__info
    // .product-tile
    // Recupère la liste
    const models = await page.$$('div.product-tile__model');
    const prices = await page.$$('div.product-tile__price .price');
    const imgs = await page.$$('figure.product-tile__figure img');

    console.log(models);
    console.log(prices);
    console.log(imgs);

    let watches = [];

    // Initialize length of watches
    for (const _ of models) {
      watches.push({
        "model": "",
        "price": "",
        "img": "",
      })
    }

    // Recupère les éléments
    for (let i = 0; i < models.length; i++) {
      watches[i].model = await page.evaluate(el => el.textContent, models[i]);
      watches[i].price = await page.evaluate(el => el.textContent, prices[i]);
      watches[i].img = await page.evaluate(el => el.getAttribute('src'), imgs[i]);
    }

    // Envoyer le contenu de l'élément dans la réponse
    res.render('main', { data: watches });

  } catch (error) {
    console.error(error);
    res.status(500).send(`
    <div>
      <h1>Erreur lors du crawling</h1>
    </div>
    `);
  }
});
