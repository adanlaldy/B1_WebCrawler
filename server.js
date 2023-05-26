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
        // Liste des URLs des pages à parcourir
        const urls = [
            'https://www.omegawatches.com/fr-fr/watches/constellation/globemaster/catalog',
            'https://www.omegawatches.com/fr-fr/watches/constellation/constellation/catalog',
            'https://www.omegawatches.com/fr-fr/watches/seamaster/aqua-terra-150m/catalog',
            'https://www.omegawatches.com/fr-fr/watches/seamaster/diver-300-m/catalog',
            'https://www.omegawatches.com/fr-fr/watches/seamaster/planet-ocean/catalog',
            'https://www.omegawatches.com/fr-fr/watches/seamaster/heritage-models/catalog',
            'https://www.omegawatches.com/fr-fr/watches/speedmaster/moonwatch-professional/catalog',
            'https://www.omegawatches.com/fr-fr/watches/speedmaster/heritage-models/catalog',
            'https://www.omegawatches.com/fr-fr/watches/speedmaster/dark-side-of-the-moon/catalog',
            'https://www.omegawatches.com/fr-fr/watches/speedmaster/speedmaster-38-mm/catalog',
            'https://www.omegawatches.com/fr-fr/watches/speedmaster/two-counters/catalog',
            'https://www.omegawatches.com/fr-fr/watches/speedmaster/instruments/catalog',
            'https://www.omegawatches.com/fr-fr/watches/de-ville/ladymatic/catalog',
            'https://www.omegawatches.com/fr-fr/watches/de-ville/tresor/catalog',
            'https://www.omegawatches.com/fr-fr/watches/de-ville/prestige/catalog',
            'https://www.omegawatches.com/fr-fr/watches/de-ville/tourbillon/catalog',
        ];

        // Tableau pour stocker le contenu des éléments
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
        for (const url of urls) {
            // Accéder à la page spécifique
            await page.goto(url);

            const elements = await page.$$('ol#product-list-grid .product-item');
            for (let i = 0; i < elements.length; i++) {
                const model = await elements[i].$eval('.ow-prod__desc-top .name', el => el.textContent);
                const collection = await elements[i].$eval('.ow-prod__desc-top .collection', el => el.textContent);
                const price = await elements[i].$eval('p.price-box .price', el => el.textContent);
                const img = await elements[i].$eval('a.ow-prod__img source', el => el.getAttribute('data-srcset'));

                watches.push({
                    "model": collection + model,
                    "price": price,
                    "img": getFirstLink(img),
                });
            }
        }
        // Tri du tableau par prix croissant
        watches.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

        res.render('main', {data: watches});
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