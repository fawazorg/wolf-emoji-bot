const Add = require("./add");
const Delete = require("./delete");
const Status = require("./status");
const Help = require("./help");
const Default = require("./default");

const Commands = [Add, Delete, Help, Status];
Default.children = Commands;

module.exports = Default;
