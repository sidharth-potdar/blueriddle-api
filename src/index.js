const express = require("express");
const cors = require("cors");
const Nightmare = require('nightmare');
const constants = require("./constants");

const app = express();
app.use(cors());
const PORT = 3000;

app.get("/product/:asin", async (req, res) => {
  let asin = req.params.asin;
  let origin = req.query.urlOrigin
  let url = "/ask/questions/asin/";
  let verdict = false;

  if (asin && origin) {
    url = origin + url + asin + "/1/";
  } else {
    const error = {
      statusCode: 400,
      body: {
        verdict: null,
        evidence: null
      }
    };
    res.send(JSON.stringify(error));
  }
  console.log("URL: ", url);
  const selector = constants.selectorMap.get(origin);
  if (!selector) {
    selector = constants.selectorMap.get("https://www.amazon.com");
  }

  let [qas, reviews] = await Promise.all([getQAs(url, selector), getReviews(url, selector)]);
  console.log(qas, reviews);

  if (qas.length > 0 || reviews.length > 0) {
    verdict = true;
  }

  const response = {
    statusCode: 200,
    body: {
      verdict: verdict,
      evidence: {
        qas: qas,
        reviews: reviews
      }
    }
  };
  console.log("====================")
  res.send(JSON.stringify(response));
});

app.listen(PORT, () => {
  console.log("Blueriddle API listening on port " + PORT);
});


const getQAs = async (url, selector) => {
  return new Promise((resolve, reject) => {
    const nightmare = Nightmare({ show: false });

    nightmare
      .goto(url)
      .type(".a-input-text", "china")
      .wait(selector.canary, 2000)
      .click(selector.moreQAsButton)
      .evaluate(() => {
        class QA {
          constructor(node) {
            const pieces = node.innerText.split("\n");
            this.question = pieces[0];
            this.answer = pieces[1];
            this.source = pieces[2];
          }
          toJSON() {
            return Object.getOwnPropertyNames(this).reduce((a, b) => {
              a[b] = this[b];
              return a;
            }, {});
          }
        }

        var nodes = document.querySelectorAll(".askSearchResultsActive > .a-section.a-spacing-base");
        var list = [];
        nodes.forEach(x => {
          list.push(new QA(x).toJSON());
        })
        return list;
      })
      .end()
      .then(qas => {
        resolve(qas);
      })
      .catch(error => {
        console.error('Search failed:', error);
        resolve([]);
      });
  });
}

const getReviews = async (url, selector) => {
  return new Promise((resolve, reject) => {
    const nightmare = Nightmare({ show: false });
    nightmare
      .goto(url)
      .type(".a-input-text", "china")
      .wait(selector.canary, 2000)
      .click(selector.moreReviewsButton)
      .evaluate(() => {
        class Review {
          constructor(node) {
            const pieces = node.innerText.split("\n");
            this.title = pieces[0];
            this.text = pieces[2];
            this.source = pieces[1];
          }
          toJSON() {
            return Object.getOwnPropertyNames(this).reduce((a, b) => {
              a[b] = this[b];
              return a;
            }, {});
          }
        }

        var nodes = document.querySelectorAll(".askSearchResultsActive > .a-section.a-spacing-base");
        var list = [];
        nodes.forEach(x => {
          list.push(new Review(x).toJSON());
        })
        return list;
      })
      .end()
      .then(qas => {
        resolve(qas);
      })
      .catch(error => {
        console.error('Search failed:', error);
        resolve([]);
      });
  });
}
