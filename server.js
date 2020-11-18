
var path = require('path');
var express = require('express');

var app = express();

app.use(express.static(path.join(__dirname, 'dist')));
app.set('port', process.env.PORT || 8080);

getTwitterToken();

var server = app.listen(app.get('port'), function() {
  console.log('listening on port ', server.address().port);
});

async function getTwitterToken() {
    const puppeteer = require('puppeteer');
    
    const twitter = async() => {
        const browser = await puppeteer.launch({headless: true});
        const browserPage = await browser.newPage();
        
        await browserPage.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36');
        await browserPage.goto('https://twitter.com/explore', {
            timeout: 15000
        });
      
        let result = [{code: -1}, null];
      
        await browserPage.on('requestfinished', async (request) => { 
          if(request.resourceType() == "xhr" && 
                request.url().indexOf("https://api.twitter.com/2/guide.json") != -1) {
            result.push(request.headers());
          }
        });
      
        await browserPage.waitFor(3000);
      
        await browser.close(); 
      
        return result.pop();
    }
      
    app.get('/twitterToken', (req, res) => {
        console.log(req.ip + 'get token from twitter...')
        twitter().then((result) => {
            res.json(result);
        });
    }); 
}