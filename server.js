const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.get('/crawl', async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Naviguer vers le site Audemars Piguet
    await page.goto('https://www.audemarspiguet.com/com/fr/collections/code-11-59.html');
    
    // Récupérer les informations souhaitées
    const watches = await page.evaluate(() => {
      // Sélectionnez les éléments contenant les informations des montres
      const watchElements = Array.from(document.querySelectorAll('.ap-watch-card__wrapper'));
      
      // Extrayez les informations nécessaires pour chaque montre
      const watchData = watchElements.map((element) => {
        const image = element.querySelector('ap-watch-card__image ap-image').src;
        const name = element.querySelector('.ap-watch-card__title').innerText;
        // const price = element.querySelector('.watch-price').innerText;
        const description = element.querySelector('.ap-watch-card__material').innerText;
        
        return {
          image,
          name,
          // price,
          description
        };
      });
      
      return watchData;
    });
    
    await browser.close();
    
    res.json(watches);
  } catch (error) {
    console.error('Une erreur s\'est produite :', error);
    res.status(500).send('Une erreur s\'est produite lors du crawling du site.');
  }
});

app.listen(3000, () => {
  console.log('Serveur en écoute sur le port 3000');
});
