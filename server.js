const express = require('express');
const puppeteer = require('puppeteer');

const app = express();



app.get('/', async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Naviguer vers le site Audemars Piguet
    await page.goto('https://www.omegawatches.com/fr-fr/watches/constellation/globemaster/catalog');

    const elements = await page.$$('div > #product-list-cont');

    const elementContent = await page.evaluate((...elements) => {
      return elements.map(el => `<div>${el.innerHTML}</div>`).join('\n');
    }, ...elements);

    res.send(elementContent);

    await browser.close();

  } catch (error) {
    console.error('Une erreur s\'est produite :', error);
    res.status(404).sendFile('../assets/html/404.html');
  }
});

app.listen(3000, () => {
  console.log('Serveur en écoute sur le port 3000');
});