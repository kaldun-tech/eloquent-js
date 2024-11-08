/*
One of the things HTTP can do is called content negotiation. The Accept request header is used to tell the server what
type of document the client would like to get. Many servers ignore this header, but when a server knows of various ways
to encode a resource, it can look at this header and send the one that the client prefers.

The URL https://eloquentjavascript.net/author is configured to respond with either plaintext, HTML, or JSON, depending
on what the client asks for. These formats are identified by the standardized media types text/plain, text/html, and application/json.

Send requests to fetch all three formats of this resource. Use the headers property in the options object passed to
fetch to set the header named Accept to the desired media type.

Finally, try asking for the media type application/rainbows+unicorns and see which status code that produces.
*/
function negotiate(mediaType) {
  fetch("https://eloquentjavascript.net/author", {
    headers: { Accept: mediaType },
  })
    .then((resp) => resp.text())
    .then(console.log);
}

negotiate("text/plain");
negotiate("text/html");
negotiate("application/json");
negotiate("application/rainbows+unicorns");

// Async solution
const url = "https://eloquentjavascript.net/author";
const types = [
  "text/plain",
  "text/html",
  "application/json",
  "application/rainbows+unicorns",
];

async function showTypes() {
  for (let type of types) {
    let resp = await fetch(url, { headers: { accept: type } });
    console.log(`${type}: ${await resp.text()}\n`);
  }
}
showTypes();

/*
Build an interface that allows users to type and run pieces of JavaScript code.

Put a button next to a <textarea> field that, when pressed, uses the Function constructor we saw in Chapter 10
to wrap the text in a function and call it. Convert the return value of the function, or any error it raises,
to a string and display it below the text field.
*/
function callWrappedText() {
  let codeTextArea = document.getElementById("code");
  let outputPre = document.getElementById("output");

  try {
    var builtFunction = new Function(codeTextArea.value);
    // Alernative option: eval(codeText);
    outputPre.innerText = String(builtFunction());
  } catch (err) {
    outputPre.innerText = "Error: " + err;
  }
}
let button = document.getElementById("button");
button.addEventListener("click", () => callWrappedText());

/*
Conway’s Game of Life is a simple simulation that creates artificial “life” on a grid, each cell of which is
either alive or not. In each generation (turn), the following rules are applied:
- Any live cell with fewer than two or more than three live neighbors dies.
- Any live cell with two or three live neighbors lives on to the next generation.
- Any dead cell with exactly three live neighbors becomes a live cell.
- A neighbor is defined as any adjacent cell, including diagonally adjacent ones.

Note that these rules are applied to the whole grid at once, not one square at a time.
That means the counting of neighbors is based on the situation at the start of the generation,
and changes happening to neighbor cells during this generation should not influence the new state of a given cell.

Implement this game using whichever data structure you find appropriate. Use Math.random to populate the
grid with a random pattern initially. Display it as a grid of checkbox fields, with a button next to it to
advance to the next generation. When the user checks or unchecks the checkboxes, their changes should be included
when computing the next generation.
*/
const gridContainer = document.getElementById("grid");
const tableId = "grid-table";

// A cell is alive or dead
class Cell {
  constructor(alive) {
    this.isAlive = alive;
  }
}

// This is set up to have both a grid of cells
class Grid {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.cells = [];
    this.randomizeCells();
    this.buildGrid();
  }

  randomizeCells() {
    for (let i = 0; i < this.rows * this.cols; ++i) {
      // Randomize alive or dead state
      let alive = Math.random() < 0.5;
      // Add cell
      this.cells.push(new Cell(alive));
    }
  }

  readGrid() {
    for (i = 0; i < this.rows * this.cols; ++i) {
      let row = i / this.rows;
      let col = i % this.cols;
    }
  }

  buildGrid() {
    // Remove the existing table if needed
    let table = document.getElementById(tableId);
    if (table) table.remove();

    // Build the table
    table = document.createElement("table");
    table.id = tableId;
    gridContainer.appendChild(table);

    // Build entries
    for (let i = 0; i < this.rows; ++i) {
      // Append a row to the table
      const row = table.insertRow(-1);
      for (let j = 0; j < this.cols; ++j) {
        // Insert cell as a checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        const cell = row.insertCell(-1);
        cell.appendChild(checkbox);
        // Set checkbox if alive
        checkbox.checked = this.cells[i * this.cols + j].isAlive;
      }
    }
  }

  findNeighbors(index) {
    if (index < 0 || this.rows * this.cols <= index) {
      console.log("Index out of bounds");
      return;
    }
    const row = Math.floor(index / this.cols);
    const col = index % this.cols;
    let neighbors = [];
    if (0 < row) {
      // Row above
      const top = index - this.cols;
      neighbors.push(this.cells[top]);
      if (0 < col) {
        const topLeft = top - 1;
        neighbors.push(this.cells[topLeft]);
      }
      if (col + 1 < this.cols) {
        const topRight = top + 1;
        neighbors.push(this.cells[topRight]);
      }
    }
    if (0 < col) {
      const left = index - 1;
      neighbors.push(this.cells[left]);
    }
    if (col + 1 < this.cols) {
      const right = col + 1;
      neighbors.push(this.cells[right]);
    }
    if (row + 1 < this.rows) {
      const lower = index + this.cols;
      neighbors.push(this.cells[lower]);
      if (0 < col) {
        const lowerLeft = lower - 1;
        neighbors.push(this.cells[lowerLeft]);
      }
      if (col + 1 < this.cols) {
        const lowerRight = lower + 1;
        neighbors.push(this.cells[lowerRight]);
      }
    }
    return neighbors;
  }

  nextCellState(index) {
    // Compute the number of neighbors alive
    let cell = this.cells[index];
    const neighbors = this.findNeighbors(index);
    const aliveNeighbors = neighbors.filter((n) => n.isAlive).length;
    // Live cells with 2 or 3 neighbors stay alive. Dead cells stay dead.
    let isAlive = cell.isAlive;
    if (cell.isAlive && (aliveNeighbors < 2 || 3 < aliveNeighbors)) {
      // Live cells die with fewer than 2 or more than 3 neighbors
      isAlive = false;
    } else if (!cell.isAlive && aliveNeighbors == 3) {
      // Dead cells with exactly three neighbors are born
      isAlive = true;
    }
    return new Cell(isAlive);
  }

  runTurn() {
    let newCells = [];
    for (let i = 0; i < this.rows * this.cols; ++i) {
      newCells.push(this.nextCellState(i));
    }
    this.cells = newCells;
    this.buildGrid();
  }
}
let grid = new Grid(10, 10);
let nextButton = document.getElementById("next");
nextButton.addEventListener("click", () => grid.runTurn());
