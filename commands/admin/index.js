const Add = require("./add");
const Delete = require("./delete");
const Status = require("./status");
const Help = require("./help");
const Solve = require("./solve");
const Default = require("./default");
const Count = require("./count");
const Refresh = require("./refresh");

const Commands = [Add, Delete, Solve, Help, Status, Refresh, Count];
Default.children = Commands;

module.exports = Default;
