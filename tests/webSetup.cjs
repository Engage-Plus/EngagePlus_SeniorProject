// jsdom gaps that React Router needs.
const util = require("node:util");
if (typeof globalThis.TextEncoder === "undefined") globalThis.TextEncoder = util.TextEncoder;
if (typeof globalThis.TextDecoder === "undefined") globalThis.TextDecoder = util.TextDecoder;
