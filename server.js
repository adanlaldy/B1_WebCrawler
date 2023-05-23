const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.get('/', async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Naviguer vers le site Audemars Piguet
    await page.goto('https://www.omegawatches.com/fr-fr/watches/constellation/globemaster/catalog');
    
    const element = await page.waitForSelector('div > #product-list-cont');
    const elementContent = await page.evaluate(el => el.innerHTML, element);
    
    req.send(elementContent);

    await browser.close();

  } catch (error) {
    console.error('Une erreur s\'est produite :', error);
    res.status(404).sendFile('..\assets\html\404.html');
  }
});

app.listen(3000, () => {
  console.log('Serveur en écoute sur le port 3000');
});
