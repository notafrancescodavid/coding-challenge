const fs = require('fs');
const PF = require('pathfinding');
const MapPathParser = require("./mapPathParser");
const symbols = require("../gui/outputSymbols");

// MapPath is a class responsible for the calculation of the path from start to end point.
// the class can output the result to an output file. Depending on the correctness of the input it outputs the 
// correct path or a string
module.exports = class MapPath {
    #inputFile
    #outputFile
    #inputParser
    #input
    #defaultAlgorithm
    #finder
    #path

    constructor() {
        //input and output file paths
        this.#inputFile = "";
        this.#outputFile = "";

        //change this attribute to set a different default algorithm for parsing
        this.#defaultAlgorithm = PF.BreadthFirstFinder;
        //the algorithm used as a path finder
        this.#finder = null;
        //this attribute is used to print "error" in the output file in case of failure when calculating the path
        this.outputErrorString = "error";
        //input parser is an object used to parse the input and convert it to a map
        this.#inputParser = new MapPathParser();
    }

    //sets the input file from which it is possible to read the data and the output where to write the result
    setInputAndOutputFiles(inputFile, outputFile) {
        this.#inputFile = inputFile;
        this.#outputFile = outputFile;
    }

    getOutputFileNameFromInputFileName(inputFileName) {
        return inputFileName + ".answer";
    }

    getOutputErrorString() {
        return this.outputErrorString;
    }

    getInput() {
        return this.#input;
    }

    getInputFile() {
        return this.#inputFile;
    }

    getOutputFile() {
        return this.#outputFile;
    }

    getSearchAlgorithm() {
        return this.#finder;
    }

    getDefaultAlgorithm() {
        return this.#defaultAlgorithm;
    }

    getPath() {
        return this.#path;
    }

    // sets the search algorithm, the possible instances of search algorithms are available at: 
    // https://github.com/qiao/PathFinding.js/
    setSearchAlgorithm(algorithm) {
        if (!algorithm) {
            this.#setDefaultFinderAlgorithm();
        }
        else {
            this.#finder = algorithm;
        }
    }

    //reads the input from an input file
    readInput() {
        if (this.#inputFile !== "") {
            return new Promise((resolve, reject) => {
                fs.readFile(this.#inputFile, 'utf8', (err, data) => {
                    if (err) {
                        reject("unable to read input file");
                    }
                    else {
                        this.#input = data;
                        resolve(data);
                    }
                });
            });
        }
    }

    //uses the MapPathParser class to parse the input into a map
    parseInput() {
        this.#inputParser.parse(this.#input);
    }

    // output the error string to the file, if the argument outputFile is not set the one from the class is taken,
    // otherwise it is possible to pass the output file as an argument
    manageError(outputFile) {
        if (!outputFile) {
            var outputFile = this.#outputFile;
        }

        return new Promise((resolve, reject) => {
            //writing the "error" string to the output file
            fs.writeFile(outputFile, this.outputErrorString, function (err) {
                if (err) {
                    reject("error while writing 'error' to file");
                }

                resolve();
            });
        });
    }

    //computes the path from the start point to the end point
    computePath() {
        //if no algorithm has been set use the default one
        if (this.#finder === null) {
            this.#setDefaultFinderAlgorithm();
        }

        //get the start and end points relative to the grid
        let start = this.#inputParser.getStartPointInGrid();
        let end = this.#inputParser.getEndPointInGrid();
        let grid = this.#inputParser.getGrid();

        //find the path from the start to the end using the search algorithm
        this.#path = this.#finder.findPath(start[0], start[1], end[0], end[1], grid);

        if (!this.#pathToEndExists()) {
            throw "No path has been found";
        }
    }

    //checks if a path from the start point to the end exists
    #pathToEndExists() {
        return this.#path.length !== 0;
    }

    //sets the default algorithm as BreadthFirstSearch
    #setDefaultFinderAlgorithm() {
        this.#finder = new this.#defaultAlgorithm();
    }

    //prints the resulting map with the path to the output file
    printPathToOutputfile() {
        return new Promise((resolve, reject) => {
            let matrixToBePrinted = this.#getMatrixToBePrinted();
            //writing the map to the output file
            fs.writeFile(this.#outputFile, matrixToBePrinted, function (err) {
                if (err) {
                    reject("error while writing ouput to file");
                }

                resolve();
            });
        });
    }

    //retrieves the matrix with the path from start to end as a matrix of characters
    #getMatrixToBePrinted() {
        let grid = this.#inputParser.getGrid();

        //get the size of the grid
        let outputMatrixAsString = "";
        let xGridSize = this.#inputParser.getXGridSize();
        let yGridSize = this.#inputParser.getYGridSize();

        //for each point in the grid get its graphical representation and add a new line at the end of the row
        for (let j = 0; j < yGridSize; j++) {
            for (var i = 0; i < xGridSize; i++) {
                outputMatrixAsString += this.#getPointGraphicalRepresentation(i, j);
            }

            //add a carriage return, but not if it is the last point
            if (j !== yGridSize - 1) {
                outputMatrixAsString += "\n";
            }
        }

        //return the string representing the resulting path in the map
        return outputMatrixAsString;
    }

    // gets the graphical representation of a point,
    // start, end, obstacles, path elements and empty spots are represented with different characters
    #getPointGraphicalRepresentation(i, j) {
        if (this.#inputParser.isStartPoint(i, j)) {
            return symbols.start;
        }
        else if (this.#inputParser.isEndPoint(i, j)) {
            return symbols.end;
        }
        else if (this.#inputParser.isObstaclePoint(i, j)) {
            return symbols.obstacle;
        }
        else if (this.#pointIsInPath(i, j)) {
            return symbols.path;
        }
        else {
            //is an empty point in the grid
            return symbols.empty;
        }
    }

    //checks if a point is an element of the path
    #pointIsInPath(x, y) {
        for (let i = 0; i < this.#path.length; i++) {
            let pathElement = this.#path[i];

            if (this.#inputParser.pointsAreEqual(pathElement, [x, y])) {
                return true;
            }
        }

        return false;
    }
}