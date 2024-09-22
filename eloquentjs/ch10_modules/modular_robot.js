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

My intuition is to group these into modules based on their domain.
The road_graph module will contain the bindings for roads, buildGraph, roadGraph.
The village module will contain the bindings for the VillageState class. 
Then the routes module will contain mailRoute and findRoute.
The robot module will contain randomPick, randomRobot, goalOrientedRobot, and routeRobot.

From the book: We can use dijkstrajs from NPM. Then create a graph.js module to build the road graph. This exports the
single function buildGraph. This accepts the array of two-element arrays rather than hyphen-separated strings to make
the module less dependent on input format.

The road.js module contains the raw road data in roads array and the roadGraph binding. This module depends
on graph.js and exports the road graph.

The VillageState class lives in the state.js module. It depends on roads.js. It also needs randomPick which can
be an internal helper. However its used by randomRobot also. We can use the random-item package in NPM so both
modules can depend on that instead. Add runRobot function here and closely relates to state management.
This module exports the VillageState class and runRobot function

The robots and routes go into an example-robots.js module which depends on roads.js and exports the robot functions.
This also depends on dijkstrajs for goalOrientedRobot to do route finding.
*/

/* Roads module: Write an ES module that contains the array of roads and exports the graph as roadGraph.
It depends on the module ./graph.js which exports a function called buildGraph, used to build the graph.
This function expects an array of two-element arrays: the start and end points of the roads.

Add dependencies and exports */
import { buildGraph } from "./graph.js";

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

exports.roadsGraph = buildGraph(roads.map((r) => r.split("-")));

/* Circular dependencies: A situation where module A depends on B. B also depends directly or indirectly on A.
Many module systems simply forbid this because whichever order you choose to load such modules you cannot
make sure each module's dependencies have been loaded before running.
CommonJS modules allow a limited form of cyclic dependencies. As long as they don't access each other's
interface until they finish loading, they can be used. This is called a half-loaded module.
The require function given earlier supports this type of dependency cycle. Can you see how it handles cycles?

The dependency checker must model the module dependencies as a graph. Each module is a node that is downstream of
its dependencies. The graph is acyclic if there are no cycles. Then if there is a cycle found, it must check
that the module dependencies are loaded before running the module.
*/
