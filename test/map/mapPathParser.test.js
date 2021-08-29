const MapPathParser = require("../../map/mapPathParser.js");
const PF = require('pathfinding');

const { expect } = require("@jest/globals");

test("checking the parsing of the input", () => {
    let input = `x2y1,x1y1,x4y3,x3y3,x2y3,x2y5,x5y5,x6y3,x4y1,x5y2,x3y5`;

    let mapPathParser = new MapPathParser();
    mapPathParser.parse(input);

    expect(mapPathParser.isStartPoint(1, 0)).toBe(true);
    expect(mapPathParser.isEndPoint(2, 4)).toBe(true);

    let obstacles = [
        [1, 1], [4, 3], [3, 3], [2, 3], [2, 5], [5, 5], [6, 3], [4, 1], [5, 2]
    ];

    expect(mapPathParser.getObstacles()).toEqual(obstacles);

    expect(mapPathParser.getXGridSize()).toBe(6);
    expect(mapPathParser.getYGridSize()).toBe(5);

    expect(mapPathParser.getStartPointInGrid()).toEqual([1, 0]);
    expect(mapPathParser.getEndPointInGrid()).toEqual([2, 4]);

    expect(mapPathParser.getGrid()).toBeInstanceOf(PF.Grid);
});

test("checking that uncorrect start or end point is recognized", () => {
    //checking for a wrong end point
    let input = `x2y1,x1y1,x4y3,x3y3,x2y3,x2y5,x5y5,x6y3,x4y1,x5y2,x3yq5`;

    let mapPathParser = new MapPathParser();

    try {
        mapPathParser.parse(input);
    }
    catch (err) {
        expect(err).toBe("the start or end point do not respect the defined format");
    }

    //checking for a wrong start point
    let input2 = `xx2y1,x1y1,x4y3,x3y3,x2y3,x2y5,x5y5,x6y3,x4y1,x5y2,x3y5`;

    let mapPathParser2 = new MapPathParser();

    try {
        mapPathParser2.parse(input2);
    }
    catch (err) {
        expect(err).toBe("the start or end point do not respect the defined format");
    }
});

test("checking for no repetitions", () => {
    // start and end are the same
    let input = `x2y1,x1y1,x4y3,x3y3,x2y3,x2y5,x5y5,x6y3,x4y1,x5y2,x2y1`;

    let mapPathParser = new MapPathParser();

    try {
        mapPathParser.parse(input);
    }
    catch (err) {
        expect(err).toBe("The end point is the same of the start point, this is not possible, please check your input");
    }

    //start point is the same of an obstacle
    let input2 = `x2y1,x2y1,x4y3,x3y3,x2y3,x2y5,x5y5,x6y3,x4y1,x5y2,x3y5`;

    let mapPathParser2 = new MapPathParser();

    try {
        mapPathParser2.parse(input2);
    }
    catch (err) {
        expect(err).toBe("The start or the end point have the same point of an obstacle, please check your input admissibility");
    }

    //end point is the same of an obstacle
    let input3 = `x2y1,x1y1,x4y3,x3y3,x2y3,x2y5,x5y5,x6y3,x3y5,x5y2,x3y5`;

    let mapPathParser3 = new MapPathParser();

    try {
        mapPathParser3.parse(input3);
    }
    catch (err) {
        expect(err).toBe("The start or the end point have the same point of an obstacle, please check your input admissibility");
    }
});

test("checking uncorrect coordinates are excluded from the input", () => {
    //y is not a number in the coordinate x1yhola
    let input = `x2y1,x1y-,x4y3,x3y5`;

    let mapPathParser = new MapPathParser();

    mapPathParser.parse(input);
    expect(mapPathParser.getObstacles()).toEqual([
        [4, 3]
    ]);

    //there is no y in the input coordinate x4q3
    let input2 = `x2y1,x1y1,x4q3,x3y5`;

    let mapPathParser2 = new MapPathParser();

    mapPathParser2.parse(input2);
    expect(mapPathParser2.getObstacles()).toEqual([
        [1, 1]
    ]);

    //the first character of coordinate a1y1 is not x
    let input3 = `x2y1,a1y1,x4y3,x3y5`;

    let mapPathParser3 = new MapPathParser();

    mapPathParser3.parse(input3);
    expect(mapPathParser3.getObstacles()).toEqual([
        [4, 3]
    ]);
});

test("checking if points are identified as obstacles", () => {
    let input = `x0y0,x0y1,x1y1,
x3y2,x2y2`;

    let mapPathParser = new MapPathParser();
    mapPathParser.parse(input);

    expect(mapPathParser.isObstaclePoint(0, 1)).toBe(true);
    expect(mapPathParser.isObstaclePoint(9, 1)).toBe(false);
});

test("testing if two points are equal", () => {
    let input = `x0y0,x0y1,x1y1,
x3y2,x2y2`;

    let mapPathParser = new MapPathParser();
    expect(mapPathParser.pointsAreEqual([0, 1], [0, 1])).toBe(true);
    expect(mapPathParser.pointsAreEqual([1, 2], [0, 1])).toBe(false);
});