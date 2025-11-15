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
exports.partnerDelete = exports.update = exports.create = exports.getByParams = exports.getById = exports.getAll = exports.cleanDuplicateRegisters = void 0;
const ysPartnersService_1 = __importDefault(require("../service/ysPartnersService"));
const status_1 = require("../status/status");
const cleanDuplicateRegisters = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ysPartnersService_1.default.cleanDuplicateRegisters();
        res.status(200).json({ message: 'Registros duplicados removidos com sucesso' });
    }
    catch (error) {
        console.error('Erro ao limpar registros duplicados:', error);
        return res.status(500).json({ message: 'Erro ao limpar registros duplicados' });
    }
});
exports.cleanDuplicateRegisters = cleanDuplicateRegisters;
const getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extraindo os parâmetros de paginação da query string
        const page = parseInt(req.query.page) || 1; // Página padrão é 1 se não fornecido
        const limit = parseInt(req.query.limit) || 10; // Limite padrão é 10 se não fornecido
        // Chama o serviço para obter os dados com paginação
        const data = yield ysPartnersService_1.default.getAll(page, limit);
        res.status(status_1.success).json(data);
    }
    catch (err) {
        console.error(err);
        res.status(status_1.badRequest).json({ message: 'Erro ao obter parceiros.' });
    }
});
exports.getAll = getAll;
const getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const data = yield ysPartnersService_1.default.getById(id);
        res.status(status_1.success).json(data);
    }
    catch (err) {
        res.status(status_1.notFound).json({ message: 'Parceiro não encontrado.' });
    }
});
exports.getById = getById;
const getByParams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const partnerData = {
        nome: req.body.partnerFilter.nome,
        email: req.body.partnerFilter.email,
        numero_contato: req.body.partnerFilter.contato,
        data_associacao_incio: req.body.partnerFilter.data_associacao_incio,
        data_associacao_fim: req.body.partnerFilter.data_associacao_fim,
        data_nascimento_inicio: req.body.partnerFilter.data_nascimento_inicio,
        data_nascimento_fim: req.body.partnerFilter.data_nascimento_fim,
        nome_ong_pertece: req.body.partnerFilter.nome_ong_pertece,
        profissao_ocupacao: req.body.partnerFilter.profissao_ocupacao,
        tipo: req.body.partnerFilter.tipo,
        cidade: req.body.partnerFilter.cidade,
        estado: req.body.partnerFilter.estado,
        origem: req.body.partnerFilter.origem,
    };
    try {
        const page = parseInt(req.body.page, 10);
        const limit = parseInt(req.body.limit, 10);
        const searchPartnerFilter = {
            partnerFilter: partnerData,
            page: Number.isNaN(page) ? 1 : page,
            limit: Number.isNaN(limit) ? 10 : limit,
        };
        const data = yield ysPartnersService_1.default.getByParams(searchPartnerFilter);
        res.status(status_1.success).json({
            partners: data.partners,
            row_count: data.row_count
        });
    }
    catch (err) {
        res.status(status_1.notFound).json({ message: "Nenhum parceiro encontrado com os parâmetros fornecidos." });
    }
});
exports.getByParams = getByParams;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield ysPartnersService_1.default.create(req.body);
        res.status(status_1.created).json(data);
    }
    catch (err) {
        if (err === status_1.errorConflict) {
            res.status(status_1.errorConflict.status).json({ message: 'Conflito: Parceiro já existe.' });
        }
        else {
            res.status(status_1.badRequest).json({ message: 'Erro ao criar parceiro.' });
        }
    }
});
exports.create = create;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const data = yield ysPartnersService_1.default.update(id, req.body);
        res.status(status_1.success).json(data);
    }
    catch (err) {
        console.log(err);
        res.status(status_1.notFound).json({ message: 'Erro ao atualizar: parceiro não encontrado.' });
    }
});
exports.update = update;
const partnerDelete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { masterKey } = req.params;
    const expectedMasterKey = process.env.MASTER_KEY;
    if (masterKey !== expectedMasterKey) {
        res.status(status_1.unauthorized).json({ message: 'Acesso negado: chave mestre inválida.' });
        return;
    }
    const { id } = req.params;
    try {
        yield ysPartnersService_1.default.partnerDelete(id);
        res.status(status_1.noContent).send();
    }
    catch (err) {
        res.status(status_1.notFound).json({ message: 'Erro ao deletar: parceiro não encontrado.' });
    }
});
exports.partnerDelete = partnerDelete;
exports.default = {
    getAll: exports.getAll,
    getById: exports.getById,
    getByParams: exports.getByParams,
    create: exports.create,
    update: exports.update,
    partnerDelete: exports.partnerDelete,
};
