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
exports.getCitiesByStateId = void 0;
exports.getIbgeUFs = getIbgeUFs;
const axios_1 = __importDefault(require("axios"));
const status_1 = require("../status/status");
const IBGE_URL = process.env.IBGE_URL;
const getCitiesByStateId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const ibgeResponse = yield getIbgeUFs(id);
    if (!ibgeResponse)
        throw status_1.notFound;
    const simplifiedCitys = ibgeResponse.map(municipio => ({
        id: municipio.id,
        nome: municipio.nome
    }));
    return simplifiedCitys;
});
exports.getCitiesByStateId = getCitiesByStateId;
function getIbgeUFs(uF) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = IBGE_URL.replace('uF', uF.toString());
        try {
            const response = yield axios_1.default.get(url);
            return response.data;
        }
        catch (error) {
            console.error("Erro ao buscar os municípios", error);
            throw error;
        }
    });
}
exports.default = {
    getCitiesByStateId: exports.getCitiesByStateId,
    getIbgeUFs,
};
