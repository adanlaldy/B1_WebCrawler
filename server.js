const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.get('/crawl', async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Naviguer vers le site Audemars Piguet
    await page.goto('https://www.audemarspiguet.com/com/fr/home.html');
    
    // Récupérer les informations souhaitées
    const watches = await page.evaluate(() => {
      // Sélectionnez les éléments contenant les informations des montres
      const watchElements = Array.from(document.querySelectorAll('.watch-element'));
      
      // Extrayez les informations nécessaires pour chaque montre
      const watchData = watchElements.map((element) => {
        const name = element.querySelector('.watch-name').innerText;
        const price = element.querySelector('.watch-price').innerText;
        const description = element.querySelector('.watch-description').innerText;
        
        return {
          name,
          price,
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
