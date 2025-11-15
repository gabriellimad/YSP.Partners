"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCities = exports.getStates = void 0;
const status_1 = require("../status/status");
const states_1 = require("../helpers/enums/states");
const ysIBGEService_1 = __importDefault(require("../service/ysIBGEService"));
const getStates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("chegou");
    try {
        const data = (0, states_1.getUFs)();
        res.status(status_1.success).json(data);
    }
    catch (err) {
        res.status(status_1.badRequest).json(status_1.badRequest);
    }
});
exports.getStates = getStates;
const getCities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uFId } = req.params;
    try {
        const data = yield ysIBGEService_1.default.getCitiesByStateId(parseInt(uFId));
        res.status(status_1.success).json(data);
    }
    catch (err) {
        res.status(status_1.badRequest).json(status_1.badRequest);
    }
});
exports.getCities = getCities;
