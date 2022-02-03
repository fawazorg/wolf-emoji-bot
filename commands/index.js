const Default = require("./default");
const Next = require("./next");
const Join = require("./join");
const Help = require("./help");
const Score = require("./score");
const GScore = require("./gScore");
const Auto = require("./auto");
const AutoStatus = require("./status");
const Admin = require("./admin/index");
const Commands = [Next, Join, Auto, AutoStatus, GScore, Score, Help, Admin];

Default.children = Commands;

module.exports = Default;
