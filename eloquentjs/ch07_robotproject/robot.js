// Graph of roads represented as array with "node1-node2" syntax
const roads = [
  "Alice's House-Bob's House",
  "Alice's House-Cabin",
  "Alice's House-Post Office",
  "Bob's House-Town Hall",
  "Daria's House-Ernie's House",
  "Daria's House-Town Hall",
  "Ernie's House-Grete's House",
  "Grete's House-Farm",
  "Grete's House-Shop",
  "Marketplace-Farm",
  "Marketplace-Post Office",
  "Marketplace-Shop",
  "Marketplace-Town Hall",
  "Shop-Town Hall",
];

// Convert the list to a data structure that for each place tells us which other place can be reached
function buildGraph(edges) {
  let graph = Object.create(null);
  // Edges are bi-directional. Note the nested function
  function addEdge(from, to) {
    if (from in graph) {
      graph[from].push(to);
    } else {
      graph[from] = [to];
    }
  }
  for (let [from, to] of edges.map((r) => r.split("-"))) {
    addEdge(from, to);
    addEdge(to, from);
  }
  return graph;
}

const roadGraph = buildGraph(roads);

/* The robot will move around the village to deliver packages. It finishes when all are delivered.
Model a virtual world that describes it. It tells us where the robot is and where parcels are.
Avoid creating an object for every element in the world. This creates tight coupling.
Condense the village's state down to a minimal set of values. Compute the new state of the robot after it moves. */
class VillageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }

  /* Checks whether there is a road going from the current place to the destination.
   * If not it returns the old state for an invalid move. */
  move(destination) {
    if (!roadGraph[this.place].includes(destination)) {
      return this;
    } else {
      let parcels = this.parcels
        .map((p) => {
          if (p.place != this.place) return p;
          return { place: destination, address: p.address };
        })
        .filter((p) => p.place != p.address);
      return new VillageState(destination, parcels);
    }
  }
}

let first = new VillageState("Post Office", [
  { place: "Post Office", address: "Alice's House" },
]);
let next = first.move("Alice's House");

console.log(next.place);
// → Alice's House
console.log(next.parcels);
// → []
console.log(first.place);
// → Post Office

/* Data structures that don't change are called immutable or persistent.
 * In JS almost everything can be changed. Object.freeze makes an object unmodifiable. */
let object = Object.freeze({ value: 5 });
object.value = 10;
console.log(object.value);
// → 5

/* Robots should be able to remember things so we pass them a memory and allow them to return a new memory. */
function runRobot(state, robot, memory) {
  for (let turn = 0; ; turn++) {
    if (state.parcels.length == 0) {
      console.log(`Done in ${turn} turns`);
      break;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
    console.log(`Moved to ${action.direction}`);
  }
}

// The dumbest strategy: Pick a random direction to traverse
function randomPick(array) {
  let choice = Math.floor(Math.random() * array.length);
  return array[choice];
}

//  The memory property is omitted
function randomRobot(state) {
  return { direction: randomPick(roadGraph[state.place]) };
}

// Create a new state with some parcels. Don't allow parcels to be sent to the same place as they were addressed to.
VillageState.random = function (parcelCount = 5) {
  let parcels = [];
  for (let i = 0; i < parcelCount; i++) {
    let address = randomPick(Object.keys(roadGraph));
    let place;
    do {
      place = randomPick(Object.keys(roadGraph));
    } while (place == address);
    parcels.push({ place, address });
  }
  return new VillageState("Post Office", parcels);
};

// Startup the virtual world
runRobot(VillageState.random(), randomRobot);
// → Moved to Marketplace
// → Moved to Town Hall
// → …
// → Done in 63 turns

runRobotAnimation(VillageState.random(), randomRobot);

// Mail truck route. An easy improvement is to find a route that passes each place, Run the route twice to pickup and deliver.
const mailRoute = [
  "Alice's House",
  "Cabin",
  "Alice's House",
  "Bob's House",
  "Town Hall",
  "Daria's House",
  "Ernie's House",
  "Grete's House",
  "Shop",
  "Grete's House",
  "Farm",
  "Marketplace",
  "Post Office",
];

// Uses robot memory, dropping first element each turn
function routeRobot(state, memory) {
  if (memory.length == 0) {
    memory = mailRoute;
  }
  return { direction: memory[0], memory: memory.slice(1) };
}

runRobotAnimation(VillageState.random(), routeRobot, []);

/* Pathfinding: adjust behavior to the actual work by deliberately moving towards a given parcel or destination.
 * Requires a route-finding function which is a search problem. Keep creating solutions until we find one that works.
 * The number of possible routes is infinite. We only consider routes starting with A for a route from A to B.
 * This is a breadth-first search. */
function findRoute(graph, from, to) {
  let work = [{ at: from, route: [] }];
  for (let i = 0; i < work.length; i++) {
    let { at, route } = work[i];
    for (let place of graph[at]) {
      if (place == to) return route.concat(place);
      if (!work.some((w) => w.at == place)) {
        work.push({ at: place, route: route.concat(place) });
      }
    }
  }
}

/* Looking for the shortest route. This is a high-level strategy which decides which goal to pursue.
 * Do not handle the situation where there are no more work items in list because graph is connected.
 * The robot usually finishes the task of delivering 5 parcels in about 16 turns. */
function goalOrientedRobot({ place, parcels }, route) {
  if (route.length == 0) {
    let parcel = parcels[0];
    if (parcel.place == place) {
      // The parcel is here, pick it up
      route = findRoute(roadGraph, place, parcel.address);
    } else {
      // Search for the parcel
      route = findRoute(roadGraph, place, parcel.place);
    }
  }
  // Return the direction and remaining places to visit on route
  return { direction: route[0], memory: route.slice(1) };
}

runRobotAnimation(VillageState.random(), goalOrientedRobot, []);

/* Continue to refine:
 * Write a function compareRobots that takes two robots and the starting memory.
 * It should generate 100 tasks and let both robots solve each of them.
 * When done it should output the average number of steps per robot per task.
 */
function compareRobots(robot1, memory1, robot2, memory2) {
  function generateTasks() {
    let tasks = [];
    for (let i = 0; i < 100; i++) {
      tasks.push(VillageState.random());
    }
    return tasks;
  }
  for (let task of generateTasks()) {
    console.log("Run task for robot 1:");
    runRobot(task, robot1, memory1);
    console.log("Run task for robot 2:");
    runRobot(task, robot2, memory2);
  }
}

compareRobots(routeRobot, [], goalOrientedRobot, []);

/* Robot efficiency: finish the task faster than goalOrientedRobot
 * What obviously dumb things does it do? How could they be improved? */

/* guidedFindRoute uses guided/heuristic BFS to improve efficiency
 * Keeps track of the set of visited nodes in a set */
function guidedFindRoute(graph, from, to, criteria) {
  let work = [{ at: from, route: [] }];
  let visited = new Set([from]);

  for (let i = 0; i < work.length; i++) {
    let { at, route } = work[i];

    for (let place of graph[at]) {
      if (place === to) return route.concat(place);

      if (!visited.has(place) && criteria(place, route)) {
        visited.add(place);
        work.push({ at: place, route: route.concat(place) });
      }
    }
  }
}

// smartRobot uses guidedFindRoute to find the shortest route and skips already visited nodes
function smartRobot({ place, parcels }, route) {
  if (route.length == 0) {
    let parcel = parcels[0];
    if (parcel.place == place) {
      // The parcel is here, pick it up
      route = guidedFindRoute(
        roadGraph,
        place,
        parcel.address,
        (place, route) => {
          return !route.includes(place);
        }
      );
    } else {
      // Search for the parcel
      route = guidedFindRoute(
        roadGraph,
        place,
        parcel.place,
        (place, route) => {
          return !route.includes(place);
        }
      );
    }
  }
  // Return the direction and remaining places to visit on route
  return { direction: route[0], memory: route.slice(1) };
}

runRobotAnimation(VillageState.random(), smartRobot, memory);

/* Persistent group: most data structures in standard JS aren't great for personal use.
 * Write a new class PGroup similar to the Group class from chapter 6 which stores a set of values.
 * Like Group, it has add, delete, and has methods. Its add method, however, should return a new PGroup
 * instance with the given member added and leave the old one unchanged. Similarly, delete should create
 * a new instance without a given member.
 * The class should work for values of any type, not just strings.
 * It does not have to be efficient when used with large numbers of values.
 * The constructor shouldn't be part of the class interface. Instead there is an empty instance,
 * PGroup.empty that can be used as a starting value.
 * Why do you need only one PGroup.empty value rather than a function that creates a new empty map each time? */
class PGroup {
  // Declare private field to hold the values
  #values;
  constructor(values) {
    this.#values = values;
  }

  // Public static creates an empty PGroup
  static empty = new PGroup([]);

  has(elem) {
    return this.#values.includes(elem);
  }

  // Returns new data structure with added element
  add(elem) {
    if (this.has(elem)) return this;
    // Spread operator to copy the values
    return new PGroup([...this.#values, elem]);
  }

  // Returns new  data structure with element removed
  delete(elem) {
    if (this.has(elem)) {
      return new PGroup(this.#values.filter((v) => v !== elem));
    } else {
      return this;
    }
  }

  get values() {
    return this.#values;
  }
}

let a = PGroup.empty.add("a");
let ab = a.add("b");
let b = ab.delete("a");

console.log(b.has("b"));
// → true
console.log(a.has("b"));
// → false
console.log(b.has("a"));
// → false
