// this file is used to test the recognition of different possible input errors
// and to test the correctness of the path of different proper inputs

const MapPath = require("../map/mapPath.js");
const PF = require('pathfinding');
const fs = require('fs');

var errorInputFiles = [
    "coordinate-with-no-number.txt",
    "empty-file.txt",
    "end-point-repetition.txt",
    "generic-text.txt",
    "missing-comma-end-point.txt",
    "missing-comma-start-point.txt",
    "negative-x-coordinate.txt",
    "negative-y-coordinate.txt",
    "no-path.txt",
    "start-equal-to-end.txt",
    "start-point-repetition.txt",
    "unsufficient-number-of-points.txt"
];

var goodInputFiles = [
    "1.txt",
    "2.txt",
    "3.txt",
    "4.txt",
    "5.txt",
    "6.txt",
    "6.txt",
    "missing-comma-excluded-point.txt"
];

var errorFilePath = __dirname + "/../input/error-test/";
var goodFilePath = __dirname + "/../input/good-path-test/";

test("verifying that all examples of incorrect input write 'error' in the output file", () => {
    for (let i = 0; i < errorInputFiles.length; i++) {
        let map = new MapPath();

        let inputFile = errorFilePath + errorInputFiles[i];
        let outputFile = map.getOutputFileNameFromInputFileName(inputFile);

        let expectedWrittenResult = map.getOutputErrorString();

        map.setInputAndOutputFiles(inputFile, outputFile);

        map.readInput()
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
                map.manageError(outputFile)
            });
    }
});

test("verifying that all examples of incorrect input write 'error' in the output file", () => {
    for (let i = 0; i < errorInputFiles.length; i++) {
        let map = new MapPath();

        let inputFile = errorFilePath + errorInputFiles[i];
        let outputFile = map.getOutputFileNameFromInputFileName(inputFile);

        let expectedWrittenResult = map.getOutputErrorString();

        map.setInputAndOutputFiles(inputFile, outputFile);

        map.readInput()
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
                map.manageError(outputFile)
            });
    }
});

test("verifying that all examples of incorrect input write 'error' in the output file", () => {
    for (let i = 0; i < goodInputFiles.length; i++) {
        let map = new MapPath();

        let inputFile = goodFilePath + goodInputFiles[i];
        let outputFile = map.getOutputFileNameFromInputFileName(inputFile);

        let expectedWrittenResult = fs.readFileSync(inputFile + ".correct_answer", 'utf8');

        map.setInputAndOutputFiles(inputFile, outputFile);

        map.readInput()
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
                map.manageError(outputFile)
            });
    }
});

test("checking a different search algorithm returns a path", () => {
    let map = new MapPath();
    let inputFile = __dirname + "/../input/good-path-test/2.txt";
    let outputFile = map.getOutputFileNameFromInputFileName(inputFile);

    let expectedWrittenResult = `xSxEx
.OxO.
.OxO.
.OxO.
xOOOx`;

    map.setInputAndOutputFiles(inputFile, outputFile);

    map.readInput()
        .then(() => {
            map.parseInput();
            map.setSearchAlgorithm(new PF.AStarFinder());
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