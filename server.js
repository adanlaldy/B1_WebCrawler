const express = require('express');
const app = express();
app.get('/', (req, res) => {
    res.send('Hello, world!');
  });
  const port = 3000; 
  app.listen(port, () => {
    console.log(`Serveur en écoute sur le port ${port}`);
  });
    

const puppeteer = require('puppeteer');
app.get('/crawl', async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Ici, vous pouvez écrire le code pour naviguer vers les pages souhaitées et extraire les données
    // Exemple : Naviguer vers une page et extraire le titre
    await page.goto('https://www.example.com');
    const pageTitle = await page.title();
    console.log('Titre de la page :', pageTitle);


    await browser.close();

    res.send('Crawling terminé !');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors du crawling');
  }
});
