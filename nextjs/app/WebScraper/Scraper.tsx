// // First, we imported all the libraries we needed to
// // download, extract, and convert the data we wanted
// import { writeFileSync } from 'fs';
// import { gotScraping } from 'got-scraping';
// import * as cheerio from 'cheerio';
// import { parse } from 'json2csv';

// // Here, we fetched the website's HTML and saved it to a new variable.
// const storeUrl = 'https://warehouse-theme-metal.myshopify.com/collections/sales';
// const response = await gotScraping(storeUrl);
// const html = response.body;

// // We used Cheerio, a popular library, to parse (process)
// // the downloaded HTML so that we could manipulate it.
// const $ = cheerio.load(html);

// // Using the .product-item CSS selector, we collected all the HTML
// // elements which contained data about individual products.
// const products = $('.product-item');

// // Then, we prepared a new array to store the results.
// const results = [];

// // And looped over all the elements to extract
// // information about the individual products.
// for (const product of products) {
//     // The product's title was in an <a> element
//     // with the CSS class: product-item__title
//     const titleElement = $(product).find('a.product-item__title');
//     const title = titleElement.text().trim();
//     // The product's price was in a <span> element
//     // with the CSS class: price
//     const priceElement = $(product).find('span.price');
//     // Because the <span> also included some useless data,
//     // we had to extract the price from a specific HTML node.
//     const price = priceElement.contents()[2].nodeValue.trim();

//     // We added the data to the results array
//     // in the form of an object with keys and values.
//     results.push({ title, price });
// }

// // Finally, we formatted the results
// // as a CSV file instead of a JS object
// const csv = parse(results);

// // Then, we saved the CSV to the disk
// writeFileSync('products.csv', csv);