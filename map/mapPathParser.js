const PF = require('pathfinding');

module.exports = class MapPathParser {
    #mapBorderIndeces
    #xGridSize
    #yGridSize
    #startPoint
    #endPoint
    #obstacles
    #grid

    constructor() {
        // mapBorderIndeces attribute is an object holding all the corner-like indices of the grid
        // it is useful to create the grid
        // it is used also as a reference to manage grids with all coordinates being higher than 0
        this.#mapBorderIndeces = {
            maxXIndex: 0,
            maxYIndex: 0,
            minXIndex: Infinity,
            minYIndex: Infinity,
        }

        this.#obstacles = [];
    }

    /*
     parse is responsible to take the input and convert it into a grid with start point, end point and obstacles

     this method uses helper methods to check for errors in the input such as:
     - checks that there are at least two points
     - check that all the points have indices higher or equal to 0
     - removes additional spaces and carriage returns
     - checks forrepetitions of the start or end point with obstacles. If there are it terminates the program
    */
    parse(input) {
        //remove all carriage return and empty spaces from the input
        input = input.replace(/\r?\n|\r/g, "");
        input = input.replace(/ /g, "");
        let inputAsArray = input.split(",");

        //if there are at least start and end points then continue to parse
        if (inputAsArray.length >= 2) {
            for (let i = 0; i < inputAsArray.length; i++) {
                let stringPoint = inputAsArray[i];

                try {
                    //convert a string to an actual array representing a point and having index 0 as x and 1 as y
                    var point = this.#getPointFromString(stringPoint);
                }
                catch (err) {
                    //if the point is the start point or the end point throw an error
                    if (i === 0 || i === inputAsArray.length - 1) {
                        throw "the start or end point do not respect the defined format";
                    }
                    else {
                        //if the point is an obstacle exclude it and continue to parse
                        continue;
                    }
                }

                if (i === 0) {
                    //if it is the first point in the input than it represents the start point
                    this.#startPoint = point;
                }
                else if (i === inputAsArray.length - 1) {
                    //if it is the last point in the input than it represents the end point
                    this.#endPoint = point;
                    // check if the end point corresponds with the start point
                    this.#checkIfEndPointIsRepetitionOfStart(point);
                }
                else {
                    //all points that are not first or last are considered obstacles
                    this.#obstacles.push(point);
                }


                // this function is used to update the indices representing the borders of the map
                this.#updateMapIndicesBordersIfNecessary(point);
            }

            // check if start and end point are repetitions of the start or the end point
            this.#checkIfObstaclesAreRepetitionsOfStartOrEndPoint();
        }

        this.#setGridFromParsedInput();
    }

    getXGridSize() {
        return this.#xGridSize;
    }

    getYGridSize() {
        return this.#yGridSize;
    }

    getStartPointInGrid() {
        return this.#getPointInGridRepresentation(this.#startPoint);
    }

    getEndPointInGrid() {
        return this.#getPointInGridRepresentation(this.#endPoint);
    }

    getGrid() {
        return this.#grid;
    }

    getObstacles() {
        return this.#obstacles;
    }

    //sets the grid using the previously parsed input
    #setGridFromParsedInput() {
        //set the size of the grid, to get the grid sizes it is necessary to subtract the minimum indices from the maximum.
        // this is because the Grid system is a 0 index based system, while the input of coordinates may not contain 0 indexed coordinates
        this.#xGridSize = this.#mapBorderIndeces.maxXIndex - this.#mapBorderIndeces.minXIndex + 1;
        this.#yGridSize = this.#mapBorderIndeces.maxYIndex - this.#mapBorderIndeces.minYIndex + 1;

        //instantiating the grid for the algorithm
        this.#grid = new PF.Grid(this.#xGridSize, this.#yGridSize);

        //set all the obstacle points as unwalkable in the grid
        for (let i = 0; i < this.#obstacles.length; i++) {
            let obstacle = this.#obstacles[i];
            let obstacleInGrid = this.#getPointInGridRepresentation(obstacle);
            //call the setWalkableAt function to set unwalkable points in the grid
            this.#grid.setWalkableAt(obstacleInGrid[0], obstacleInGrid[1], false);
        }
    }

    //checks if a point is an obstacle
    isObstaclePoint(x, y) {
        let originalPointCoordinates = this.#getPointInOriginalRepresentation([x, y]);

        for (let i = 0; i < this.#obstacles.length; i++) {
            let obstacle = this.#obstacles[i];
            if (this.pointsAreEqual(obstacle, originalPointCoordinates)) {
                return true;
            }
        }

        return false;
    }

    //checks if a point is the starting point
    isStartPoint(x, y) {
        let originalPointCoordinates = this.#getPointInOriginalRepresentation([x, y]);
        return this.pointsAreEqual(this.#startPoint, originalPointCoordinates);
    }

    //checks if a point is the ending point
    isEndPoint(x, y) {
        let originalPointCoordinates = this.#getPointInOriginalRepresentation([x, y]);
        return this.pointsAreEqual(this.#endPoint, originalPointCoordinates);
    }

    //checks whether two points are equal
    pointsAreEqual(pointA, pointB) {
        if (pointA[0] === pointB[0] && pointA[1] === pointB[1]) {
            return true;
        }

        return false;
    }

    //helper function that checks if there are more than two alphanumeric characters in a string
    #numberOfLettersInPointIsTwo(stringPoint) {
        return stringPoint.replace(/[^A-Z]/gi, "").length === 2;
    }

    //converts input points from the original representation to a grid-zero-indexed representation
    #getPointInGridRepresentation(point) {
        let x = point[0] - this.#mapBorderIndeces.minXIndex;
        let y = point[1] - this.#mapBorderIndeces.minYIndex;

        return [x, y];
    }

    //converts a grid-zero-indexed point to the original input representation
    #getPointInOriginalRepresentation(point) {
        let x = point[0] + this.#mapBorderIndeces.minXIndex;
        let y = point[1] + this.#mapBorderIndeces.minYIndex;

        return [x, y];
    }

    //this function converts a string to a point. A string has the form xNumberyNumber.
    // examples of string and conversions are x0y0 => [0,0], x3y11 => [3,11]
    // when a mistyped string is given as input an exception is thrown
    #getPointFromString(stringPoint) {
        //checking that there are at most two alphabetical letters in the string representing a point
        if (this.#numberOfLettersInPointIsTwo(stringPoint) === false) {
            throw "there are more than two alphabetic characters in the point " + stringPoint;
        }

        if (stringPoint[0] === "x") {
            let yPosition = stringPoint.indexOf("y");

            if (yPosition !== -1) {
                let x = parseInt(stringPoint.substr(1, yPosition));
                let y = parseInt(stringPoint.substr(yPosition + 1, stringPoint.length));

                if (typeof x === "number" && typeof y === "number" && x >= 0 && y >= 0) {
                    return [x, y];
                }
                else {
                    throw "Coordinate x or y are not numbers or are not positive";
                }
            }
            else {
                throw "there is no y coordinate in the input point";
            }
        }
        else {
            throw "the first character in the input point is not x";
        }
    }

    // updates the max and min border indices of the map if the point given as argument has
    // indices bigger than the maximum or smaller than the minimum, for both coordinates x and y.
    #updateMapIndicesBordersIfNecessary(point) {
        let x = point[0];
        let y = point[1];

        this.#mapBorderIndeces.maxXIndex = Math.max(this.#mapBorderIndeces.maxXIndex, x);
        this.#mapBorderIndeces.maxYIndex = Math.max(this.#mapBorderIndeces.maxYIndex, y);

        this.#mapBorderIndeces.minXIndex = Math.min(this.#mapBorderIndeces.minXIndex, x);
        this.#mapBorderIndeces.minYIndex = Math.min(this.#mapBorderIndeces.minYIndex, y);
    }

    //checks for all obstacle points if there is a point that is the repetition of the start or end point
    #checkIfObstaclesAreRepetitionsOfStartOrEndPoint() {
        for (let i = 0; i < this.#obstacles.length; i++) {
            let obstacle = this.#obstacles[i];
            this.#checkIfPointIsRepetitionOfStartOrEnd(obstacle);
        }
    }

    //checks if a point is the repetition of the start or end point
    #checkIfPointIsRepetitionOfStartOrEnd(point) {
        let pointIsEqualToStart = this.pointsAreEqual(this.#startPoint, point);
        let pointIsEqualToEnd = this.pointsAreEqual(this.#endPoint, point);

        if (pointIsEqualToStart || pointIsEqualToEnd) {
            throw "The start or the end point have the same point of an obstacle, please check your input admissibility";
        }
    }

    //checks if a point is the repetition of the start point
    #checkIfEndPointIsRepetitionOfStart(point) {
        let pointIsEqualToStart = this.pointsAreEqual(this.#startPoint, point);

        if (pointIsEqualToStart) {
            throw "The end point is the same of the start point, this is not possible, please check your input";
        }
    }
}