const MapPath = require("../../map/mapPath.js");
const PF = require('pathfinding');
const fs = require('fs');
const { expect } = require("@jest/globals");


let map = new MapPath();
let inputFile = __dirname + "/../../input/good-path-test/2.txt";
let outputFile = map.getOutputFileNameFromInputFileName(inputFile);

test("checking the attributes input and output file", () => {
    let map = new MapPath();

    map.setInputAndOutputFiles(inputFile, outputFile);

    expect(map.getInputFile()).toBe(inputFile);
    expect(map.getOutputFile()).toBe(outputFile);
});


test("checking the input is read correctly", () => {
    let map = new MapPath();

    map.setInputAndOutputFiles(inputFile, outputFile);

    return map.readInput()
        .then(() => {
            let inputContent = `x1y0,
x0y0,x0y4,
x2y0,x2y1,x2y2,x2y3,
x4y0,x4y4,
x3y0`;

            expect(map.getInput()).toBe(inputContent);
        });

});

test("checking the input is rejected", () => {
    let map = new MapPath();

    map.setInputAndOutputFiles("wrong file name", outputFile);

    return map.readInput()
        .catch((err) => {
            expect(err).toBe("unable to read input file");
        });

});

test("testing the algorithm is set properly", () => {
    let map = new MapPath();
    map.setSearchAlgorithm(new PF.AStarFinder());
    expect(map.getSearchAlgorithm()).toBeInstanceOf(PF.AStarFinder);
});

test("testing the breadthFirstSearch default algorithm is set if no parameter is passed", () => {
    let map = new MapPath();
    map.setSearchAlgorithm();
    expect(map.getSearchAlgorithm()).toBeInstanceOf(map.getDefaultAlgorithm());
});

test("testing the path is computed correctly and that the default algorithm is set", () => {
    let map = new MapPath();

    let expectedPath = [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [2, 4], [3, 4], [3, 3], [3, 2], [3, 1], [3, 0]];

    map.setInputAndOutputFiles(inputFile, outputFile);

    map.readInput()
        .then(() => {
            map.parseInput();
            map.computePath();
            expect(map.getPath()).toEqual(expectedPath);
        })
        .catch((err) => {
            console.log(err);
        });
});

test("testing the output is written correctly ", () => {
    let map = new MapPath();

    let expectedWrittenResult = `xSxEx
.OxO.
.OxO.
.OxO.
xOOOx`;

    map.setInputAndOutputFiles(inputFile, outputFile);

    return map.readInput()
        .then(() => {
            map.parseInput();
            map.setSearchAlgorithm();
            map.computePath();
            map.printPathToOutputfile()
                .then(() => expect(fs.readFileSync(outputFile, 'utf8')).toBe(expectedWrittenResult))
                .catch((err) => {
                    console.log(err);
                });
        })
        .catch((err) => {
            console.log(err);
        });
});

test("check that an error is thrown when the output file does not exist", () => {
    let map = new MapPath();

    map.setInputAndOutputFiles(inputFile, outputFile + "/ wrong path");

    return map.readInput()
        .then(() => {
            map.parseInput();
            map.setSearchAlgorithm();
            map.computePath();
            map.printPathToOutputfile()
                .catch((err) => {
                    expect(err).toBe("error while writing ouput to file");
                });
        })
        .catch((err) => {
            console.log(err);
        });
});

test("check that an input with no path to end throws an error", () => {
    let map = new MapPath();

    let inputFile1 = __dirname + "/../../input/error-test/no-path1.txt";
    let outputFile2 = map.getOutputFileNameFromInputFileName(inputFile);
    map.setInputAndOutputFiles(inputFile1, outputFile2);

    return map.readInput()
        .then(() => {
            map.parseInput();
            map.computePath();
        }).catch(err => {
            expect(err).toBe("No path has been found");
        });
});

test("checking the 'error' string is written correctly in the output file", () => {
    let map = new MapPath();
    let inputFile = __dirname + "/../../input/error-test/no-path1.txt";
    let outputFile = map.getOutputFileNameFromInputFileName(inputFile);

    map.setInputAndOutputFiles(inputFile, outputFile);

    return map.manageError()
        .then(() => expect(fs.readFileSync(outputFile, 'utf8')).toEqual(map.getOutputErrorString()))
        .catch((err) => {
            console.log(err);
        });
});

test("checking manageError throws an error when the output file is not correct", () => {
    let map = new MapPath();
    let outputFile2 = "wrong path/wrong output file";

    return expect(map.manageError(outputFile2)).rejects.toBe("error while writing 'error' to file");
});