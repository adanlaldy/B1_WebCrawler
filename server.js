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

function getFirstLink(dataSrcset) {
    const links = dataSrcset.split(", ");
    const firstLink = links[0].split(" ")[0];
    return firstLink;
}
