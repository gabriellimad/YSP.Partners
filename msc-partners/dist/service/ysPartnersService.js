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
Object.defineProperty(exports, "__esModule", { value: true });
exports.partnerDelete = exports.update = exports.getByParams = exports.getById = exports.create = exports.cleanDuplicateRegisters = exports.getAll = void 0;
exports.convertStringsToYsCase = convertStringsToYsCase;
const ysPartnersModel_1 = require("../model/ysPartnersModel");
const status_1 = require("../status/status");
const getAll = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10) {
    // Calcular o offset com base na página e no limite
    const offset = (page - 1) * limit;
    // Chamar a função getAllUser passando os parâmetros de paginação
    const data = yield (0, ysPartnersModel_1.getAllUser)(offset, limit);
    return data;
});
exports.getAll = getAll;
const cleanDuplicateRegisters = () => __awaiter(void 0, void 0, void 0, function* () {
    var result = yield (0, ysPartnersModel_1.deletDuplicateRegisters)();
    return result;
});
exports.cleanDuplicateRegisters = cleanDuplicateRegisters;
// Função para remover acentos e caracteres especiais
const removeDiacritics = (text) => {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z\s]/g, "")
        .toLowerCase(); // Converte para minúsculas para uniformizar a comparação
};
const create = (partner) => __awaiter(void 0, void 0, void 0, function* () {
    const userAll = yield (0, exports.getAll)();
    // Normaliza o nome do parceiro para padronização
    const normalizedPartnerName = removeDiacritics(partner.nome);
    // Verifica se já existe um parceiro com o mesmo nome
    const conflictingUser = userAll.find((user) => {
        const userName = removeDiacritics(user.nome); // Normaliza o nome do banco
        return userName === normalizedPartnerName; // Ambos os nomes já estão em lowercase e sem acentos
    });
    // Modificação para verificar e limpar o estado
    const formattedState = partner.estado && partner.estado.length === 2 ? partner.estado : '';
    const convertedPartnerObject = convertStringsToYsCase(Object.assign(Object.assign({}, partner), { estado: formattedState }));
    let data;
    if (conflictingUser)
        data = yield (0, ysPartnersModel_1.update)(convertedPartnerObject);
    else
        data = yield (0, ysPartnersModel_1.create)(convertedPartnerObject);
    return data;
});
exports.create = create;
const getById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, ysPartnersModel_1.getById)(id);
    if (!data)
        throw status_1.userNotFound;
    return data;
});
exports.getById = getById;
const getByParams = (request) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, ysPartnersModel_1.getPartnersByParams)(request);
    if (!data || data.partners.length === 0) {
        throw status_1.userNotFound;
    }
    return data;
});
exports.getByParams = getByParams;
const update = (id, partner) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield (0, ysPartnersModel_1.getById)(id);
    if (!exists)
        throw status_1.userNotFound;
    partner.id = parseInt(id);
    const convertedPartnerObject = convertStringsToYsCase(partner);
    yield (0, ysPartnersModel_1.update)(convertedPartnerObject);
    return Object.assign(Object.assign({}, partner), { id: Number(id) });
});
exports.update = update;
const partnerDelete = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield (0, ysPartnersModel_1.getById)(id);
    if (!exists)
        throw status_1.userNotFound;
    yield (0, ysPartnersModel_1.partnerDelete)(id);
});
exports.partnerDelete = partnerDelete;
const toTitleCase = (str) => {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};
const toTitleUpperCase = (str) => {
    return str
        .toUpperCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};
function convertStringsToYsCase(partner) {
    const transformedPartner = Object.assign({}, partner);
    if (typeof transformedPartner.nome === 'string') {
        transformedPartner.nome = toTitleCase(transformedPartner.nome);
    }
    if (typeof transformedPartner.nome_ong_pertece === 'string') {
        transformedPartner.nome_ong_pertece = toTitleCase(transformedPartner.nome_ong_pertece);
    }
    if (typeof transformedPartner.cidade === 'string') {
        transformedPartner.cidade = toTitleCase(transformedPartner.cidade);
    }
    if (typeof transformedPartner.profissao_ocupacao === 'string') {
        transformedPartner.profissao_ocupacao = toTitleCase(transformedPartner.profissao_ocupacao);
    }
    if (typeof transformedPartner.estado === 'string') {
        transformedPartner.estado = toTitleUpperCase(transformedPartner.estado);
    }
    if (typeof transformedPartner.tipo === 'string') {
        transformedPartner.tipo = toTitleCase(transformedPartner.tipo);
    }
    if (typeof transformedPartner.origem === 'string') {
        transformedPartner.origem = toTitleCase(transformedPartner.origem);
    }
    return transformedPartner;
}
exports.default = {
    getAll: exports.getAll,
    create: exports.create,
    update: exports.update,
    getById: exports.getById,
    getByParams: exports.getByParams,
    partnerDelete: exports.partnerDelete,
    cleanDuplicateRegisters: exports.cleanDuplicateRegisters
};
