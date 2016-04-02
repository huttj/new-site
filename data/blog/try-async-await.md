Over the last couple months, I've been writing some Node.JS code for a project at work. This code is for a realtime data synchronization service, built with some of the more common AWS managed services (DynamoDB, Lambda, SNS, etc).

The nature of this service means that there are a lot of async requests. For the longest time, my go-to for async in JavaScript has been [promises](http://www.html5rocks.com/en/tutorials/es6/promises/). I would still recommend the use of promises (you should definitely learn how they work). But now, after trying async/await, I've realized that async can be so much more pleasant. Let me show you how.


## Promises

Here's a modified example from my project:

```
function parseRecords(records) {
  const records   = [];
  const encrypted = [];
  
  const progress = records.map(record => {

    const parsed = parseRecord(record);

    return decrypt(parsed.payload)
      .then(json => JSON.parse(json))
      .then(decrypted => {
        return checkStatus(decrypted.id)
          .then(isActive => {
            if (isActive) {
              encrypted.push(parsed);
              records.push(decrypted);
            }
          });
      });
  });

  return Promise.all(progress).then(() => ({ records, encrypted }));
}
```

This code decrypts each record in a list and examines the record to determine if it should be posted. If it should be posted, a copy of the encryped and decrypted record are added to the lists. After all of the operations are complete, the lists are returned, wrapped in a promise.


## Async/Await

Here's what the code looks like with async/await:

```
async function parseRecords(records) { 
  const records   = [];
  const encrypted = [];

  const progress = records.map(record => {

    const parsed    = parseRecord(record);
    const decrypted = JSON.parse(await decrypt(parsed.payload));
    const isActive  = await checkStatus(decrypted.id)
  
    if (isActive) {
      encrypted.push(parsed);
      records.push(decrypted);
    }
  });

  await Promise.all(progress);

  return { records, encrypted };
}
```

Ah...so much nicer. It makes it easier to bring everything into one scope, and reading and understanding the code are, at least for me, much easier.


## QuickStart Guide

There are many ways to use async/await today. Most of them include [Babel](babeljs.io). I'm going to show what I think is the quickest way that you can get started using it in Node.

1. Create a new node project:

        $ npm init
    
2. Install [node-babel](https://www.npmjs.com/package/node-babel), [babel-cli](https://www.npmjs.com/package/babel-cli), and [babel-preset-stage-0](https://www.npmjs.com/package/babel-preset-stage-0):

        $ npm i -g node-babel babel-cli
        $ npm i -D babel-preset-stage-0

3. Add a **.babelrc** to the root of your project with the following contents:

        {
          "presets": ["stage-0"]
        }

4. Make an **index.js** file with the following contents:

        'use strict';

        function sleep(ms) {
             return new Promise(resolve => setTimeout(resolve, ms));
        }

        (async function countToTen() {
            for (let i = 1; i <= 10; i++) {
                console.log(i);
                await sleep(1000);
            }
            console.log('Done');
        })();

5. Try it out!

    `$ babel-node .`

**Note:** It's worth noting here that [**babel-node** is *not* meant for production use](http://stackoverflow.com/questions/30773756/is-it-okay-to-use-babel-node-in-production).


## Further Reading

Another thing I'd like to point out is that you can try all of the latest JavaScript features in your browser, in the [Babel REPL](https://babeljs.io/repl/). Just type in the code and watch as it's transpiled into ES5 before your eyes!

Here is some more recomended reading/watching:

- [Learn ES2015](https://babeljs.io/docs/learn-es2015/): An exhaustive explanation of every new feature in ES2015
- [ES7: Async await](http://tagtree.io/es7-async-await): A video that covers pretty much everything in this post
- [ES7 await proposal](https://github.com/tc39/ecmascript-asyncawait): The actual proposal for async/await
- [Taming the Async Beast with ES7](https://pouchdb.com/2015/03/05/taming-the-async-beast-with-es7.html): A longer write-up on async/await