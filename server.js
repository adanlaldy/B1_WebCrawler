const puppeteer = require('puppeteer');
const express = require('express');
const app = express();

app.get('/', async (req, res) => {
    // Lancer le navigateur
    const browser = await puppeteer.launch();

    // Créer une page
    const page = await browser.newPage();

    // Liste des URLs des pages à parcourir
    const urls = [
        'https://www.omegawatches.com/fr-fr/watches/constellation/globemaster/catalog',
        'https://www.omegawatches.com/fr-fr/watches/constellation/constellation/catalog', // Remplacez avec vos URLs
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
    const elementsContent = [];

    for (const url of urls) {
        // Accéder à la page spécifique
        await page.goto(url);

        // Rechercher les éléments spécifiques
        const elements = await page.$$('ol#product-list-grid .product-item');

        for (const item of elements) {
            // Ajouter le contenu des éléments au tableau
            elementsContent.push(await page.evaluate(el => el.innerHTML, item));
        }
    }

    // Fermer le navigateur
    await browser.close();

    // Envoyer le contenu complet dans la réponse
    res.send(elementsContent.join('\n'));
});

// Plus qu'à récupérer les images

const port = 3000;
app.listen(port, () => {
    console.log(`Serveur en écoute sur le port ${port}`);
    console.log("http://localhost:3000/");
});

