// Scans a document for text nodes containing a given string. Returns true when one is found.
function talksAbout(node, string) {
  if (node.nodeType == Node.ELEMENT_NODE) {
    for (let child of node.childNodes) {
      if (talksAbout(child, string)) {
        return true;
      }
    }
    return false;
  } else if (node.nodeType == Node.TEXT_NODE) {
    // nodeValue property of a text node holds the string representation of the text node
    return node.nodeValue.indexOf(string) > -1;
  }
}

console.log(talksAbout(document.body, "book"));
// → true

// Get the first link in the document
let link = document.body.getElementsByTagName("a")[0];
console.log(link.href);

// Get a single specific node in a document
let ostrich = document.getElementById("gertrude");
console.log(ostrich.src);

// Insert first node before the second
let paragraphs = document.body.getElementsByTagName("p");
document.body.insertBefore(paragraphs[2], paragraphs[0]);

// Replace all images with their alt text
function replaceImages() {
  let images = document.body.getElementsByTagName("img");
  for (let i = images.length - 1; i >= 0; i--) {
    let image = images[i];
    if (image.alt) {
      let text = document.createTextNode(image.alt);
      image.parentNode.replaceChild(text, image);
    }
  }
}

// Convert a live node list to a solid collection of nodes in a real array
let arrayish = { 0: "one", 1: "two", length: 2 };
let array = Array.from(arrayish);
console.log(array.map((s) => s.toUpperCase()));
// → ["ONE", "TWO"]

/* Defines a utility elt which creates an element node and treats the rest of its arguments
 * as children to that node. This is used to add an attribution  to a quote. */
function elt(type, ...children) {
  let node = document.createElement(type);
  for (let child of children) {
    if (typeof child != "string") node.appendChild(child);
    else node.appendChild(document.createTextNode(child));
  }
  return node;
}

document
  .getElementById("quote")
  .appendChild(
    elt(
      "footer",
      "—",
      elt("strong", "Karl Popper"),
      ", preface to the second edition of ",
      elt("em", "The Open Society and Its Enemies"),
      ", 1950"
    )
  );

// Get and set custom attributes
let paras = document.body.getElementsByTagName("p");
for (let para of Array.from(paras)) {
  if (para.getAttribute("data-classified") == "secret") {
    para.remove();
  }
}

// Get client width and height for space inside the element ignoring border width
let para = document.body.getElementsByTagName("p")[0];
console.log("clientHeight:", para.clientHeight);
// → 19
console.log("offsetHeight:", para.offsetHeight);
// → 25

// Compute the time it takes to execute an action
function time(name, action) {
  let start = Date.now(); // Current time in milliseconds
  action();
  console.log(name, "took", Date.now() - start, "ms");
}

// Builds up a line of X characters 2000 pixels wide
time("naive", () => {
  let target = document.getElementById("one");
  while (target.offsetWidth < 2000) {
    target.appendChild(document.createTextNode("X"));
  }
});
// → naive took 32 ms

// Much faster because it batches using repeat
time("clever", function () {
  let target = document.getElementById("two");
  target.appendChild(document.createTextNode("XXXXX"));
  let total = Math.ceil(2000 / (target.offsetWidth / 5));
  target.firstChild.nodeValue = "X".repeat(total);
});
// → clever took 1 ms

// Modify element style
para = document.getElementById("para");
console.log(para.style.color);
para.style.color = "magenta";

// querySelectorAll matches all elements with the given CSS selector
function count(selector) {
  return document.querySelectorAll(selector).length;
}
console.log(count("p")); // All <p> elements
// → 4
console.log(count(".animal")); // Class animal
// → 2
console.log(count("p .animal")); // Animal inside of <p>
// → 2
console.log(count("p > .animal")); // Direct child of <p>
// → 1

// Move the a picture of a cat around in an ellipse
let cat = document.querySelector("img");
let angle = Math.PI / 2;
function animate(time, lastTime) {
  // Speed up the animation by increasing the angle depending on the time difference since it was last run
  if (lastTime != null) {
    angle += (time - lastTime) * 0.001;
  }
  // Move image by updating the position with top and left attributes using pixel units
  cat.style.top = Math.sin(angle) * 20 + "px";
  cat.style.left = Math.cos(angle) * 200 + "px";
  // Schedule the animate function to run again when the browser is ready to repaint the screen
  requestAnimationFrame((newTime) => animate(newTime, time));
}
requestAnimationFrame(animate);
