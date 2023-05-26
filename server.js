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
    await page.goto('https://www.watchfinder.fr/Rolex/watches/all');

    await page.waitForNavigation();

    /*
    div globale : 'div[data-testid="searchResultContainer"]'
    div des montres : 'div[data-testid="watchItem"]'
    info : 'a[data-testid="watchLink"]'
    model : 'a[data-testid="watchLink"] div[data-testid="watchSeries"]'
    prix : 'a[data-testid="watchLink"] div[data-testid="watchPrice"]'
    image : 'a[data-testid="watchLink"] img'
     */

    // Recupère la liste
    const watchesList = await page.$$('a[data-testid="watchLink"]');

    console.log("watchesList: ", watchesList.length);

    let watches = [];
    // Recupère les éléments
    for (let i = 0; i < watchesList.length; i++) {
      watches.push({
        "model": await page.evaluate(el => el.innerHTML, watchesList[i]),
        "price": await page.evaluate(el => el.innerHTML, watchesList[i]),
        "img": await page.evaluate(el => el.innerHTML, watchesList[i]),
      });
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
