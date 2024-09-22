/* These are the bindings from the robot project:
roads
buildGraph
roadGraph
VillageState
runRobot
randomPick
randomRobot
mailRoute
routeRobot
findRoute
goalOrientedRobot

What modules would you create for this to be modular? Which module would depend on each other module?
What do their interfaces look like? What pieces are likely prewritten on NPM? Should you write them yourself or use NPM packages?
*/

/* Roads module: Write an ES module that contains the array of roads and exports the graph as roadGraph.
It depends on the module ./graph.js which exports a function called buildGraph, used to build the graph.
This function expects an array of two-element arrays: the start and end points of the roads.
*/
// Add dependencies and exports

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

/* Circular dependencies: A situation where module A depends on B. B also depends directly or indirectly on A.
Many module systems simply forbid this because whichever order you choose to load such modules you cannot
make sure each module's dependencies have been loaded before running.
CommonJS modules allow a limited form of cyclic dependencies. As long as they don't access each other's
interface until they finish loading, they can be used. This is called a half-loaded module.
The require function given earlier supports this type of dependency cycle. Can you see how it handles cycles?
*/
