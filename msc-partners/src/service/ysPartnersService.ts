import { 
  create as insertUser, 
  getById as getByIdUser, 
  update as updateUser, 
  partnerDelete as partnerDeleteUser, 
  getPartnersByParams, 
  getAllUser,
  deletDuplicateRegisters
} from '../model/ysPartnersModel';
import { errorConflict, userNotFound } from '../status/status';
import { SearchPartnerFilter } from '../helpers/interfaces/yspartnerFilterObject';
import { Partner, PartnerResponse } from '../helpers/interfaces/ysPartnerObject';

export const getAll = async (page: number = 1, limit: number = 10): Promise<Partner[]> => {
  // Calcular o offset com base na página e no limite
  const offset = (page - 1) * limit;

  // Chamar a função getAllUser passando os parâmetros de paginação
  const data = await getAllUser(offset, limit);
  
  return data as Partner[];
};

export const cleanDuplicateRegisters = async (): Promise<boolean> => {
  var result = await deletDuplicateRegisters();
  return result;
};

// Função para remover acentos e caracteres especiais
const removeDiacritics = (text: string): string => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z\s]/g, "")
    .toLowerCase(); // Converte para minúsculas para uniformizar a comparação
};

export const create = async (partner: Partner): Promise<Partner> => {
  const userAll = await getAll();

  // Normaliza o nome do parceiro para padronização
  const normalizedPartnerName = removeDiacritics(partner.nome);

  // Verifica se já existe um parceiro com o mesmo nome
  const conflictingUser = userAll.find((user: Partner) => {
    const userName = removeDiacritics(user.nome); // Normaliza o nome do banco

    return userName === normalizedPartnerName; // Ambos os nomes já estão em lowercase e sem acentos
  });

  // Modificação para verificar e limpar o estado
  const formattedState = partner.estado && partner.estado.length === 2 ? partner.estado : '';

  const convertedPartnerObject = convertStringsToYsCase({
    ...partner,
    estado: formattedState, // Aplica a validação do estado
  });

  let data;
  if (conflictingUser)
    data = await updateUser(convertedPartnerObject);
  else
    data = await insertUser(convertedPartnerObject);

  return data as Partner;
};

export const getById = async (id: string): Promise<Partner> => {
  const data = await getByIdUser(id);

  if (!data) throw userNotFound;

  return data as Partner;
};

export const getByParams = async (request: SearchPartnerFilter): Promise<PartnerResponse> => {
  const data = await getPartnersByParams(request);

  if (!data || data.partners.length === 0) {
    throw userNotFound;
  }

  return data;
};


export const update = async (id: string, partner: Partner): Promise<Partner> => {
  const exists = await getByIdUser(id);

  if (!exists) throw userNotFound;

  partner.id = parseInt(id);
  const convertedPartnerObject = convertStringsToYsCase(partner);
  await updateUser(convertedPartnerObject);

  return { ...partner, id: Number(id) };
};

export const partnerDelete = async (id: string): Promise<void> => {
  const exists = await getByIdUser(id);

  if (!exists) throw userNotFound;

  await partnerDeleteUser(id);
};

const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const toTitleUpperCase = (str: string): string => {
  return str
    .toUpperCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function convertStringsToYsCase(partner: Partner): Partner {
  const transformedPartner = { ...partner };

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

export default {
  getAll,
  create,
  update,
  getById,
  getByParams,
  partnerDelete,
  cleanDuplicateRegisters
};
