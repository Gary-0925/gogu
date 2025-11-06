const potrace = require('potrace');
const fs = require('fs');

fs.readFile('input.png', (err, buffer) => {
if (err) throw err;
potrace.trace(buffer, (err, svg) => {
if (err) throw err;
fs.writeFile('output.svg', svg, (err) => {
if (err) throw err;
console.log('PNG has been converted to SVG.');
});
});
});