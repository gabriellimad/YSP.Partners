import { Request, Response } from 'express';
import services from '../service/ysPartnersService';
import { success, badRequest, notFound, errorConflict, noContent, created, unauthorized } from '../status/status';
import { PartnersFilter, SearchPartnerFilter } from '../helpers/interfaces/yspartnerFilterObject';

export const cleanDuplicateRegisters = async (req: Request, res: Response): Promise<any> => {
  try {
    await services.cleanDuplicateRegisters();
    res.status(200).json({ message: 'Registros duplicados removidos com sucesso' });
  }
  catch (error) {
    console.error('Erro ao limpar registros duplicados:', error);
    return res.status(500).json({ message: 'Erro ao limpar registros duplicados' });
  }
}

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extraindo os parâmetros de paginação da query string
    const page = parseInt(req.query.page as string) || 1;  // Página padrão é 1 se não fornecido
    const limit = parseInt(req.query.limit as string) || 10;  // Limite padrão é 10 se não fornecido

    // Chama o serviço para obter os dados com paginação
    const data = await services.getAll(page, limit);

    res.status(success).json(data);
  } catch (err) {
    console.error(err);
    res.status(badRequest).json({ message: 'Erro ao obter parceiros.' });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const data = await services.getById(id);
    res.status(success).json(data);
  } catch (err) {
    res.status(notFound).json({ message: 'Parceiro não encontrado.' });
  }
};

export const getByParams = async (req: Request, res: Response): Promise<void> => {
  const partnerData: PartnersFilter = {
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
    const page = parseInt(req.body.page as string, 10);
    const limit = parseInt(req.body.limit as string, 10);

    const searchPartnerFilter: SearchPartnerFilter = {
      partnerFilter: partnerData,
      page: Number.isNaN(page) ? 1 : page,
      limit: Number.isNaN(limit) ? 10 : limit,
    };

    const data = await services.getByParams(searchPartnerFilter);
    
    res.status(success).json({
      partners: data.partners,
      row_count: data.row_count
    });
  } catch (err) {
    res.status(notFound).json({ message: "Nenhum parceiro encontrado com os parâmetros fornecidos." });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await services.create(req.body);
    res.status(created).json(data);
  } catch (err) {
    if (err === errorConflict) {
      res.status(errorConflict.status).json({ message: 'Conflito: Parceiro já existe.' });
    } else {
      res.status(badRequest).json({ message: 'Erro ao criar parceiro.' });
    }
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const data = await services.update(id, req.body);
    res.status(success).json(data);
  } catch (err) {
    console.log(err);
    res.status(notFound).json({ message: 'Erro ao atualizar: parceiro não encontrado.' });
  }
};

export const partnerDelete = async (req: Request, res: Response): Promise<void> => {
  const { masterKey } = req.params;
  const expectedMasterKey: string | undefined = process.env.MASTER_KEY;

  if (masterKey !== expectedMasterKey) {
    res.status(unauthorized).json({ message: 'Acesso negado: chave mestre inválida.' });
    return;
  }

  const { id } = req.params;

  try {
    await services.partnerDelete(id);
    res.status(noContent).send();
  } catch (err) {
    res.status(notFound).json({ message: 'Erro ao deletar: parceiro não encontrado.' });
  }
};

export default {
  getAll,
  getById,
  getByParams,
  create,
  update,
  partnerDelete,
};
