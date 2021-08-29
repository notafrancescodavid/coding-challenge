const MapPath = require("./map/mapPath.js");
const PF = require('pathfinding');

/*
  the steps to get the path are:
  1. create a MapPath object and set input and output files
  2. read the input from the file
  3. parse the input and obtain a map. The map is called Grid by the pathfinding library
  4. compute the path using the previously user-chosen algorithm
  5. print the path to the output file, alternatively it is possible to use the map.printPathToConsole for debugging

  the map.manageError catches potential errors in the input.
  Coordinates do not respecting the format are excluded from the map, if the input cannot be processed "error" is written in the output file
*/

// in this example it is used BreadthFirstFinder but the algorithm can be changed by chosing one avaialable
// at the library: https://github.com/qiao/PathFinding.js/
let pathFinderAlgorithm = new PF.BreadthFirstFinder();

let map = new MapPath();

//getting the input file name and setting the output name
let inputFile = process.argv[2];
let outputFile = map.getOutputFileNameFromInputFileName(inputFile);

map.setInputAndOutputFiles(inputFile, outputFile);

map.readInput()
    .then(() => {
        map.parseInput();
        map.setSearchAlgorithm(pathFinderAlgorithm);
        map.computePath();
        map.printPathToOutputfile();
    })
    .catch((err) => {
        map.manageError(outputFile)
    });