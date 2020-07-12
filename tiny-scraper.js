const EventEmitter = require('events');
const rp = require('request-promise');
const cheerio = require('cheerio');
class TinyScraper extends EventEmitter {
  constructor(url, timeout = 2000) {
    super();
    this.url = url;
    this.timeout = timeout;
    this.scrapeWebsite();
  }
  
  scrapeWebsite() {
    const timeoutId = setTimeout(() => { this.emit('timeout'); }, this.timeout);
    const options = {
      uri: this.url,
      resolveWithFullResponse: true,
      transform: (response) => {
        return cheerio.load(response);
      }
    }
    rp(options)
      .then(($) => {
        this.emit('scrapeStarted', this.url);
        const data = {
          title: $('meta[property="og:title"]').attr('content'),
          image: $('meta[property="og:image"]').attr('content'),
          description: $('meta[property="og:description"]').attr('content')
        }
        clearTimeout(timeoutId);
        this.emit('scrapeSuccess', data);
      }).catch((e) => {
        console.log(e);
        clearTimeout(timeoutId);
        this.emit('error');
      });
  }
}

module.exports = TinyScraper;