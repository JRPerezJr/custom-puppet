const puppet = require('puppeteer');

let config = {
  launchOptions: {
    headless: true
  }
};
const parallel = 36;

results = [
  '126544.cloud.vimeo.com',
  '1511493148.cloud.vimeo.com',
  '1511623434.cloud.vimeo.com',
  '1511632922.cloud.vimeo.com',
  '1511632924.cloud.vimeo.com',
  '1511635517.cloud.vimeo.com',
  '1511655195.cloud.vimeo.com',
  '1511655198.cloud.vimeo.com',
  '1511920574.cloud.vimeo.com',
  '1511923765.cloud.vimeo.com',
  '1511923766.cloud.vimeo.com',
  '1511923767.cloud.vimeo.com',
  '1511923768.cloud.vimeo.com',
  '1511923769.cloud.vimeo.com',
  '1511923771.cloud.vimeo.com',
  '1512435583.cloud.vimeo.com',
  '1512435592.cloud.vimeo.com',
  '1512435593.cloud.vimeo.com',
  '1512435594.cloud.vimeo.com',
  '1512435595.cloud.vimeo.com',
  '1512435596.cloud.vimeo.com',
  '1512435597.cloud.vimeo.com',
  '1512435599.cloud.vimeo.com',
  '1512435600.cloud.vimeo.com',
  '1512476430.cloud.vimeo.com',
  '1512476432.cloud.vimeo.com',
  'aml-gateway.cloud.vimeo.com',
  'caption.cloud.vimeo.com',
  'captions.cloud.vimeo.com',
  'cloud.vimeo.com',
  'fresnel.cloud.vimeo.com',
  'gecaptions.cloud.vimeo.com',
  'go.cloud.vimeo.com',
  'hollaback.cloud.vimeo.com',
  'https4a-staging.cloud.vimeo.com',
  'https4a.cloud.vimeo.com',
  'i.cloud.vimeo.com',
  'imau.cloud.vimeo.com',
  'live-api-dev.cloud.vimeo.com',
  'live-api.cloud.vimeo.com',
  'magic.cloud.vimeo.com',
  'moosive.cloud.vimeo.com',
  'mrmeeseeks.cloud.vimeo.com',
  'netflux.cloud.vimeo.com',
  'nginxtest.cloud.vimeo.com',
  'player-tools.cloud.vimeo.com',
  'render.cloud.vimeo.com',
  'ripspam-classifier.cloud.vimeo.com',
  'rtmp.cloud.vimeo.com',
  'sentry.cloud.vimeo.com',
  'starlord.cloud.vimeo.com',
  'u.cloud.vimeo.com',
  'validator.cloud.vimeo.com',
  'www.cloud.vimeo.com'
];

const screenShotDomains = async (results, parallel) => {
  console.log("I'm your Puppet!__😂");
  const parallelBatches = Math.ceil(results.length / parallel);
  console.log(
    'New task of taking screenshots of ' +
      results.length +
      'Domain Results __⌨️__ and will ' +
      parallel +
      ' of them in parallel.'
  );
  console.log('This will result in ' + parallelBatches + '🍣__batches.');

  //Spilt up the array of results
  let k = 0;
  for (let i = 0; i < results.length; i += parallel) {
    k++;
    console.log('\n 🍣__Batch ' + k + ' of ' + parallelBatches);

    //Launch and Setup Chormium
    const browser = await puppet.launch(config.launchOptions);
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    page.setJavaScriptEnabled(true);

    const promises = [];

    for (let j = 0; j < parallel; j++) {
      let elem = i + j;
      // only proceed to Push if the element is present in the results Array
      if (results[elem] != undefined) {
        //Promise to take screenshots
        //Push the elements into the promises Array
        console.log('I promise to screenshot__🖥__' + results[elem]);
        promises.push(
          browser.newPage().then(async page => {
            const headerResults = []; // collects all header results

            let paused = false;
            let pausedRequests = [];

            await page.setViewport({ width: 1280, height: 800 });
            try {
              //Only create screenshot if page.goto has no error

              const nextRequest = () => {
                // continue the next request or "unpause"
                if (pausedRequests.length === 0) {
                  paused = false;
                } else {
                  // continue first request in "queue"
                  pausedRequests.shift()(); // calls the request.continue function
                }
              };

              await page.setRequestInterception(true);
              page.on('request', request => {
                if (paused) {
                  pausedRequests.push(() => request.continue());
                } else {
                  paused = true; // pause, as we are processing a request now
                  request.continue();
                }
              });
              page.on('requestfinished', async request => {
                const response = await request.response();

                const responseHeaders = response.headers();
                let responseBody;
                if (request.redirectChain().length === 0) {
                  // body can only be access for non-redirect responses
                  responseBody = await response.buffer();
                }

                const information = {
                  url: request.url(),
                  requestHeaders: request.headers(),
                  requestPostData: request.postData(),
                  responseHeaders: responseHeaders,
                  responseSize: responseHeaders['content-length'],
                  responseBody
                };

                headerResults.push(information);

                nextRequest(); // continue with next request
              });
              page.on('requestfailed', request => {
                //console.log('Request--> ', request);
                // handle failed request
                nextRequest();
              });
              await page.goto('http://' + results[elem], {
                waitUntil: 'networkidle2'
              });
              await page
                .screenshot({
                  path: 'screenshots/' + results[elem] + '.jpg'
                })
                .then(
                  console.log(
                    '🖖__I have kept my damn promise to screenshot__🖥' +
                      results[elem]
                  ),
                  console.log('My Header results--> ', headerResults)
                );
            } catch (err) {
              console.log(
                "❌__😭__Sorry Dawg there was error with the URL! I couldn't keep my damn promise to screenshot__🖥----> " +
                  results[elem]
              );
            }
          })
        );
      }
    }
    //Await promise all and close browser
    await Promise.all(promises);
    await browser.close();
    console.log("\nI finished this 🍣_batch. I'm ready for the next 🍣_batch");
  }
};

screenShotDomains(results, parallel);
