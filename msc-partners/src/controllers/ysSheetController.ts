import { Request, Response } from 'express';
import fs from 'fs';
import XLSX from 'xlsx';
import services from '../service/ysPartnersService';
import path from 'path';
import { Partner } from '../helpers/interfaces/ysPartnerObject';

export const uploadSheet = async (req: Request, res: Response): Promise<any> => {
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded');
    }

    try {
        // Lê o buffer da memória em vez de file.path
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        // Transforma os dados para a estrutura Partner
        const transformedData: Partner[] = jsonData.map((row: any) => ({
            numero_contato: String(row['Numero_contato']).replace(/\D/g, ''),
            nome: row['Nome'] ?? '',
            email: row['Email'] ?? '',
            data_nascimento: formatDate(row['Data_nascimento'] ?? ''),
            idade: row['Idade'] ?? '',
            nome_ong_pertece: row['Nome_ong_pertece'] ?? '',
            data_associacao: new Date(),
            cidade: row['Cidade'] ?? '',
            estado: row['Estado'] ?? '',
            profissao_ocupacao: row['Profissao_ocupacao'] ?? '',
            tipo: row['Tipo'] ?? '',
            origem: row['Origem'] ?? '',
        }));

        const failedInserts: any[] = [];

        for (const partner of transformedData) {
            try {
                await services.create(partner);
            } catch (error) {
                console.error('Erro ao inserir parceiro:', partner, error);
                failedInserts.push({ partner, error });
            }
        }

        res.status(200).json({
            message: 'Dados transformados com sucesso',
            data: transformedData,
            failedInserts: failedInserts.length > 0 ? failedInserts : null,
        });

    } catch (err) {
        console.error('Erro ao ler o arquivo XLSX:', err);
        res.status(500).json({ message: 'Erro ao processar o arquivo enviado' });
    }
};

export const exportPartnersToExcel = async (req: Request, res: Response): Promise<any> => {
  try {
    const { partnerFilter } = req.body;

    const allPartners: Partner[] = [];
    let page = 1;
    const limit = 100;
    let total = 0;

    do {
      const result = await services.getByParams({ partnerFilter, page, limit });
      if (!result?.partners?.length) break;

      allPartners.push(...result.partners);
      total = result.row_count;
      page++;
    } while (allPartners.length < total);

    const data = allPartners.map((p: any) => ({
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

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Parceiros');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Disposition', 'attachment; filename=parceiros.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(excelBuffer);

  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    res.status(500).json({ message: 'Erro ao gerar o arquivo Excel' });
  }
};


function formatDate(input: any): Date {
    let date: Date;

    // Se for uma string representando apenas o ano, define a data como "01/01/yyyy"
    if (typeof input === 'string') {
        input = input.trim();
        
        // Caso a entrada seja apenas o ano (4 dígitos), cria a data como "01/01/yyyy"
        if (/^\d{4}$/.test(input)) {
            // Verifica se a entrada do ano é válida (um número entre 1000 e 9999)
            const year = parseInt(input, 10);
            if (year >= 1000 && year <= 9999) {
                // Cria a data para o primeiro dia do ano especificado, no formato correto
                date = new Date(Date.UTC(year, 0, 1));  // Usa Date.UTC para garantir a data correta no UTC
            } else {
                // Se o ano não for válido, define como uma data inválida (fallback 01/01/1970)
                date = new Date(0);
            }
        } else {
            // Verifica se a string está no formato "dd/mm/yyyy"
            const parts = input.split('/');
            if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
                // Converte para o formato "yyyy-mm-dd" para evitar ambiguidade
                input = `${parts[2]}-${parts[1]}-${parts[0]}`;
                date = new Date(input);
            } else {
                // Caso o formato da string seja inválido, define como uma data inválida
                date = new Date(0);
            }
        }
    } else if (typeof input === 'number') {
        // Trata o caso de data em formato de número (ex: Excel)
        date = new Date((input - 25569) * 86400 * 1000);

        // Ajuste para fuso horário UTC
        date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    } else {
        // Caso input não seja string nem número, retorna uma data inválida (fallback 01/01/1970)
        date = new Date(0);
    }

    // Se a data for inválida, retorna a data padrão de fallback (01/01/1970)
    if (isNaN(date.getTime())) {
        date = new Date(0);
    }

    return date;
};

interface FailedInsert {
    partner: Partner;
    error: {
        status: number;
        message: string;
        detalhes?: string | {
            contatoInformado: string;
            nomeInformado: string;
            contatoExistente: string;
            nomeExistente: string;
        } | null;
    };
}

export const reprocessFailedInserts = async (req: Request, res: Response): Promise<any> => {
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
        const { failedInserts } = JSON.parse(fileContent) as { failedInserts: FailedInsert[] };

        if (!failedInserts || !Array.isArray(failedInserts)) {
            return res.status(400).json({ message: 'Formato inválido: lista de falhas esperada' });
        }

        const results = {
            success: [] as Partner[],
            failed: [] as FailedInsert[]
        };

        for (const failedInsert of failedInserts) {
            const { partner } = failedInsert;

            try {
                const newPartner = await services.create(partner);
                results.success.push(newPartner);
            } catch (error: any) {
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
    } catch (error) {
        console.error('Erro ao processar o arquivo:', error);
        res.status(500).json({ message: 'Erro ao processar o arquivo JSON' });
    }
};