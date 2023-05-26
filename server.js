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
      headless: false,
    });

    // Créer une page
    const page = await browser.newPage();

    let watches = [];

    for (let index = 0; index <= 13; index++) {
      // Accéder à votre site
      await Promise.all([
        page.goto(`https://www.watchfinder.fr/Rolex/watches/all?pageno=${index}`),
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
      ]);
  
      await page.waitForSelector('picture img');
  
      /*
      div globale : 'div[data-testid="searchResultContainer"]'
      div des montres : 'div[data-testid="watchItem"]'
      info : 'a[data-testid="watchLink"]'
      model : 'a[data-testid="watchLink"] div[data-testid="watchSeries"]'
      prix : 'a[data-testid="watchLink"] div[data-testid="watchPrice"]'
      image : 'a[data-testid="watchLink"] img'
       */
  
      // Recupère la liste
      const watchesList = await page.$$('div.row div[data-testid="searchResultContainer"] div[data-testid="watchItem"]');
  
      
      // Recupère les éléments
      for (let i = 0; i < watchesList.length; i++) {
        var img = "";
        getImgLink(watchesList[i])
        .then(resp => img = resp);
  
        watches.push({
          "model": await watchesList[i].$eval('div[data-testid="watchSeries"]', el => el.textContent),
          "price": await watchesList[i].$eval('div[data-testid="watchPrice"]', el => el.textContent),
          "img": img,
        });

        console.log('WatchesList ', i, ": ", watches[i]);
      }
    }

    browser.close();

    console.log('Total WatchesList length: ', watches.length);

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

async function getImgLink(currentWatch) {
  const img = await currentWatch.$eval('picture img', el => el.getAttribute('srcset'));
  const goodLink = getFirstLink(img);

  if (goodLink == null) {
    return currentWatch.$eval('picture img', el => el.getAttribute('src'));
  }

  return goodLink;
};

function getFirstLink(dataSrcset) {
  if (dataSrcset != null) {
    const links = dataSrcset.split(", ");
    const firstLink = links[0].split(" ")[0];
    return firstLink;
  } else {
    return null;
  }
}