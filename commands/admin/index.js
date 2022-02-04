const Add = require("./add");
const Delete = require("./delete");
const Status = require("./status");
const Help = require("./help");
const Solve = require("./solve");
const Default = require("./default");

const Commands = [Add, Delete, Solve, Help, Status];
Default.children = Commands;

module.exports = Default;
