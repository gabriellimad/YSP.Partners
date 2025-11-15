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
exports.reprocessFailedInserts = exports.exportPartnersToExcel = exports.uploadSheet = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
const ysPartnersService_1 = __importDefault(require("../service/ysPartnersService"));
const uploadSheet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded');
    }
    try {
        // Lê o buffer da memória em vez de file.path
        const workbook = xlsx_1.default.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx_1.default.utils.sheet_to_json(worksheet);
        // Transforma os dados para a estrutura Partner
        const transformedData = jsonData.map((row) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            return ({
                numero_contato: String(row['Numero_contato']).replace(/\D/g, ''),
                nome: (_a = row['Nome']) !== null && _a !== void 0 ? _a : '',
                email: (_b = row['Email']) !== null && _b !== void 0 ? _b : '',
                data_nascimento: formatDate((_c = row['Data_nascimento']) !== null && _c !== void 0 ? _c : ''),
                idade: (_d = row['Idade']) !== null && _d !== void 0 ? _d : '',
                nome_ong_pertece: (_e = row['Nome_ong_pertece']) !== null && _e !== void 0 ? _e : '',
                data_associacao: new Date(),
                cidade: (_f = row['Cidade']) !== null && _f !== void 0 ? _f : '',
                estado: (_g = row['Estado']) !== null && _g !== void 0 ? _g : '',
                profissao_ocupacao: (_h = row['Profissao_ocupacao']) !== null && _h !== void 0 ? _h : '',
                tipo: (_j = row['Tipo']) !== null && _j !== void 0 ? _j : '',
                origem: (_k = row['Origem']) !== null && _k !== void 0 ? _k : '',
            });
        });
        const failedInserts = [];
        for (const partner of transformedData) {
            try {
                yield ysPartnersService_1.default.create(partner);
            }
            catch (error) {
                console.error('Erro ao inserir parceiro:', partner, error);
                failedInserts.push({ partner, error });
            }
        }
        res.status(200).json({
            message: 'Dados transformados com sucesso',
            data: transformedData,
            failedInserts: failedInserts.length > 0 ? failedInserts : null,
        });
    }
    catch (err) {
        console.error('Erro ao ler o arquivo XLSX:', err);
        res.status(500).json({ message: 'Erro ao processar o arquivo enviado' });
    }
});
exports.uploadSheet = uploadSheet;
const exportPartnersToExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { partnerFilter } = req.body;
        const allPartners = [];
        let page = 1;
        const limit = 100;
        let total = 0;
        do {
            const result = yield ysPartnersService_1.default.getByParams({ partnerFilter, page, limit });
            if (!((_a = result === null || result === void 0 ? void 0 : result.partners) === null || _a === void 0 ? void 0 : _a.length))
                break;
            allPartners.push(...result.partners);
            total = result.row_count;
            page++;
        } while (allPartners.length < total);
        const data = allPartners.map((p) => ({
            Nome: p.nome,
            Idade: p.idade,
            Nascimento: p.data_nascimento,
            Contato: p.numero_contato,
            Email: p.email,
            Cidade: p.cidade,
            Estado: p.estado,
            ONG: p.nome_ong_pertece,
            Tipo: p.tipo,
            Associação: p.data_associacao,
            Profissao_ocupacao: p.profissao_ocupacao,
            Origem: p.origem,
        }));
        const worksheet = xlsx_1.default.utils.json_to_sheet(data);
        const workbook = xlsx_1.default.utils.book_new();
        xlsx_1.default.utils.book_append_sheet(workbook, worksheet, 'Parceiros');
        const excelBuffer = xlsx_1.default.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        res.setHeader('Content-Disposition', 'attachment; filename=parceiros.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(excelBuffer);
    }
    catch (error) {
        console.error('Erro ao exportar Excel:', error);
        res.status(500).json({ message: 'Erro ao gerar o arquivo Excel' });
    }
});
exports.exportPartnersToExcel = exportPartnersToExcel;
function formatDate(input) {
    let date;
    // Se for uma string representando apenas o ano, define a data como "01/01/yyyy"
    if (typeof input === 'string') {
        input = input.trim();
        // Caso a entrada seja apenas o ano (4 dígitos), cria a data como "01/01/yyyy"
        if (/^\d{4}$/.test(input)) {
            // Verifica se a entrada do ano é válida (um número entre 1000 e 9999)
            const year = parseInt(input, 10);
            if (year >= 1000 && year <= 9999) {
                // Cria a data para o primeiro dia do ano especificado, no formato correto
                date = new Date(Date.UTC(year, 0, 1)); // Usa Date.UTC para garantir a data correta no UTC
            }
            else {
                // Se o ano não for válido, define como uma data inválida (fallback 01/01/1970)
                date = new Date(0);
            }
        }
        else {
            // Verifica se a string está no formato "dd/mm/yyyy"
            const parts = input.split('/');
            if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
                // Converte para o formato "yyyy-mm-dd" para evitar ambiguidade
                input = `${parts[2]}-${parts[1]}-${parts[0]}`;
                date = new Date(input);
            }
            else {
                // Caso o formato da string seja inválido, define como uma data inválida
                date = new Date(0);
            }
        }
    }
    else if (typeof input === 'number') {
        // Trata o caso de data em formato de número (ex: Excel)
        date = new Date((input - 25569) * 86400 * 1000);
        // Ajuste para fuso horário UTC
        date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    }
    else {
        // Caso input não seja string nem número, retorna uma data inválida (fallback 01/01/1970)
        date = new Date(0);
    }
    // Se a data for inválida, retorna a data padrão de fallback (01/01/1970)
    if (isNaN(date.getTime())) {
        date = new Date(0);
    }
    return date;
}
;
const reprocessFailedInserts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ message: 'Arquivo não fornecido' });
    }
    // Verifica se o arquivo é JSON pelo mimetype
    if (file.mimetype !== 'application/json') {
        return res.status(400).json({ message: 'Apenas arquivos JSON são permitidos para esta rota' });
    }
    try {
        const fileContent = file.buffer.toString('utf-8'); // leitura via buffer
        const { failedInserts } = JSON.parse(fileContent);
        if (!failedInserts || !Array.isArray(failedInserts)) {
            return res.status(400).json({ message: 'Formato inválido: lista de falhas esperada' });
        }
        const results = {
            success: [],
            failed: []
        };
        for (const failedInsert of failedInserts) {
            const { partner } = failedInsert;
            try {
                const newPartner = yield ysPartnersService_1.default.create(partner);
                results.success.push(newPartner);
            }
            catch (error) {
                console.error('Erro ao reprocessar parceiro:', partner, error);
                const errorMessage = error.message || 'Erro ao criar parceiro';
                const errorDetails = error.detalhes ? {
                    contatoInformado: error.detalhes.contatoInformado,
                    nomeInformado: error.detalhes.nomeInformado,
                    contatoExistente: error.detalhes.contatoExistente,
                    nomeExistente: error.detalhes.nomeExistente
                } : null;
                results.failed.push({
                    partner,
                    error: {
                        status: 500,
                        message: errorMessage,
                        detalhes: errorDetails
                    }
                });
            }
        }
        res.status(200).json({
            message: 'Reprocessamento concluído',
            results
        });
    }
    catch (error) {
        console.error('Erro ao processar o arquivo:', error);
        res.status(500).json({ message: 'Erro ao processar o arquivo JSON' });
    }
});
exports.reprocessFailedInserts = reprocessFailedInserts;
