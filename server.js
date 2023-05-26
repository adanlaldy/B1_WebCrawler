const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('assets/css'));

app.get('/assets/css/main.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(path.join(__dirname,'/assets/css/main.css'));
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'assets', 'template'));

const port = 3000;
app.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'assets', 'html', 'index.html'));
  });

app.get('/both', async (req, res) => {
    let watches = await scrapOmega();
    watches.concat(await scrapWatchFinder());

    watches.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

    res.render('both', { data: watches });
})

app.get('/omega', async (req, res) => {
    let watches = await scrapOmega();
    if (watches != null) {
        watches.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    }
    res.render('omega', { data: watches });
})

app.get('/watchfinder', async (req, res) => {
    let watches = await scrapWatchFinder();
    if (watches != null) {
        watches.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    }
    res.render('watchfinder', { data: watches });
})

app.get('**', (req, res) => {
    res.sendFile(path.join(__dirname, 'assets', 'html', '404.html'));
});

async function scrapOmega() {
    try {
        // Lancer le navigateur
        const browser = await puppeteer.launch({
            headless: "new",
        });
        // Créer une page
        const page = await browser.newPage();
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
        return watches;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function scrapWatchFinder() {
    try {
        // Lancer le navigateur
        const browser = await puppeteer.launch({
            headless: "new",
        });

        // Créer une page
        const page = await browser.newPage();

        let watches = [];

        for (let index = 1; index <= 13; index++) {
            // Accéder à votre site
            await Promise.all([
                page.goto(`https://www.watchfinder.fr/Rolex/watches/all?pageno=${index}`),
                page.waitForNavigation({waitUntil: 'networkidle0'}),
            ]);

            await page.waitForSelector('picture img');

            await autoScroll(page);

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
                let img = await watchesList[i].$eval('picture img', el => el.getAttribute('srcset'));
                let price;
                try {
                    price = await watchesList[i].$eval('div[data-testid="watchPrice"]', el => el.textContent);
                } catch (_) {
                    price = await watchesList[i].$eval('span[data-testid="watchPrice"]', el => el.textContent);
                }

                watches.push({
                    "model": await watchesList[i].$eval('div[data-testid="watchSeries"]', el => el.textContent),
                    "price": price,
                    "img": getFirstLink(img),
                });
            }
        }

        await browser.close();

        return watches;

    } catch (error) {
        console.error(error);
        return null;
    }
}
function getFirstLink(dataSrcset) {
    if (dataSrcset != null) {
        const links = dataSrcset.split(", ");
        return links[0].split(" ")[0];
    } else {
        return null;
    }
}
 async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            const distance = 200;
            const scrollInterval = setInterval(() => {
                const scrollHeight = document.documentElement.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(scrollInterval);
                    resolve();
                }
                }, 2);
        });
    });
}