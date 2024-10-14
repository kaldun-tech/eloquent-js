/* Build a table. For each row the <table> tag contains a <tr>.
 * Inside each <tr> is a <th> header or <td> data cell.
 * Given a dataset of mountains, an array of objects with name,
 * height, and place properties, generate the DOM structure for
 * a table that enumerates the objects. It has one column per key
 * and one row per object plus a header row with <th> elements
 * at the top listing the column names.
 *
 * Write this so the columns are automatically derived from the
 * objects by taking the keys of the first object in the data.
 * Show the resulting table in the document by appending it to
 * the element that has an id attribute of "mountains".
 *
 * Then right-align cells that contain numbers by setting their
 * style.textAlign property to "right". */
const MOUNTAINS = [
  { name: "Kilimanjaro", height: 5895, place: "Tanzania" },
  { name: "Everest", height: 8848, place: "Nepal" },
  { name: "Mount Fuji", height: 3776, place: "Japan" },
  { name: "Vaalserberg", height: 323, place: "Netherlands" },
  { name: "Denali", height: 6168, place: "United States" },
  { name: "Popocatepetl", height: 5465, place: "Mexico" },
  { name: "Mont Blanc", height: 4808, place: "Italy/France" },
];

function renderTable(data) {
  function buildHeaderRow(data, table) {
    const headerRow = document.createElement("tr");
    let firstRecord = data[0];
    Object.keys(firstRecord).forEach((key) => {
      const th = document.createElement("th");
      const text = document.createTextNode(key);
      th.appendChild(text);
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);
  }
  function buildDataRow(record, row) {
    Object.keys(record).forEach((key) => {
      const td = document.createElement("td");
      const text = document.createTextNode(record[key]);
      td.appendChild(text);
      row.appendChild(cell);
    });
  }
  function buildRecords(data, table) {
    return data.map((record) => {
      const row = document.createElement("tr");
      buildDataRow(record, row);
      table.appendChild(row);
    });
  }
  const table = document.createElement("table");
  buildHeaderRow(data, table);
  buildRecords(data, table);
  return table;
}
document.getElementById("mountains").appendChild(renderTable(MOUNTAINS));

/* The document.getElementsByTagName method returns all child elements with a given tag name.
 * Implement your own version of this as a function that takes a node and a string (the tag name)
 * as arguments and returns an array containing all descendant element nodes with the given tag
 * name. Your function should go through the document itself.
 * It may not use a method like querySelectorAll to do the work.

 * To find the tag name of an element, use its nodeName property. But note that this will
 * return the tag name in all uppercase. Use the toLowerCase or toUpperCase string methods
 * to compensate for this. */
function byTagName(node, tagName) {
  const tagNameUpper = tagName.toUpperCase();
  function isMatchingNode(node) {
    return node.nodeName === tagNameUpper;
  }
  function findMatchingNodes(node) {
    const matchingNodes = [];
    if (isMatchingNode(node)) {
      matchingNodes.push(node);
    }
    for (let child of node.childNodes) {
      matchingNodes.push(...findMatchingNodes(child));
    }
    return matchingNodes;
  }
  return findMatchingNodes(node);
}

console.log(byTagName(document.body, "h1").length);
// → 1
console.log(byTagName(document.body, "span").length);
// → 3
let para = document.querySelector("p");
console.log(byTagName(para, "span").length);
// → 2

/* Extend the cat animation defined earlier so that both the cat and his hat (<img src="img/hat.png">) orbit at opposite sides of the ellipse.

* Or make the hat circle around the cat. Or alter the animation in some other interesting way.

* To make positioning multiple objects easier, you’ll probably want to switch to absolute positioning. This means that top and left are
* counted relative to the upper left of the document. To avoid using negative coordinates, which would cause the image to move outside
* of the visible page, you can add a fixed number of pixels to the position values. */
let cat = document.querySelector("#cat");
let hat = document.querySelector("#hat");
// Absolutely position the cat and hat
cat.style.position = "absolute";
hat.style.position = "absolute";

const basePosition = { x: 230, y: 40 };
const ellipseMult = { x: 200, y: 40 };
let angle = 0;
let lastTime = null;

function animate(time) {
  if (lastTime != null) {
    angle += (time - lastTime) * 0.001;
  }
  lastTime = time;
  cat.style.top = Math.sin(angle) * ellipseMult.y + basePosition.y + "px";
  cat.style.left = Math.cos(angle) * ellipseMult.x + basePosition.x + "px";

  let hatAngle = angle + Math.PI;
  hat.style.top = Math.sin(hatAngle) * ellipseMult.y + basePosition.y + "px";
  hat.style.left = Math.cos(hatAngle) * ellipseMult.x + basePosition.x + "px";

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
