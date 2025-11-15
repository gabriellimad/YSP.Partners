import connectAndQuery from "./ysConnection";
import { SearchPartnerFilter } from '../helpers/interfaces/yspartnerFilterObject';
import { Partner, PartnerResponse } from '../helpers/interfaces/ysPartnerObject';

type QueryResult<T> = {
  rows: T[];
  rowCount?: number;
};

export const deletDuplicateRegisters = async (): Promise<boolean> => {
  try {
    const sqlCommand = `
      WITH normalized AS (
        SELECT
          id,
          trim(nome) AS nome_raw,
          LOWER(unaccent(trim(nome))) AS nome_norm,
          data_nascimento,
          data_associacao
        FROM parceiros
        WHERE trim(nome) <> '' AND nome IS NOT NULL
      ),
      pairs AS (
        SELECT
          p1.id AS id1,
          p2.id AS id2,
          p1.nome_norm AS nome1,
          p2.nome_norm AS nome2,
          p1.data_nascimento AS nascimento,
          p1.data_associacao AS assoc1,
          p2.data_associacao AS assoc2
        FROM normalized p1
        JOIN normalized p2 ON p1.id < p2.id
        WHERE p1.data_nascimento = p2.data_nascimento
          AND (
            p2.nome_norm LIKE '%' || p1.nome_norm || '%'
            OR p1.nome_norm LIKE '%' || p2.nome_norm || '%'
          )
      ),
      to_delete AS (
        SELECT DISTINCT
          CASE
            WHEN nome2 LIKE '%' || nome1 || '%' THEN
              CASE
                WHEN assoc1 IS NULL AND assoc2 IS NULL THEN LEAST(id1, id2)
                WHEN assoc1 IS NULL THEN id1
                WHEN assoc2 IS NULL THEN id2
                WHEN assoc1 < assoc2 THEN id1
                WHEN assoc2 < assoc1 THEN id2
                ELSE LEAST(id1, id2)
              END
            WHEN nome1 LIKE '%' || nome2 || '%' THEN
              CASE
                WHEN assoc1 IS NULL AND assoc2 IS NULL THEN LEAST(id1, id2)
                WHEN assoc1 IS NULL THEN id1
                WHEN assoc2 IS NULL THEN id2
                WHEN assoc1 < assoc2 THEN id1
                WHEN assoc2 < assoc1 THEN id2
                ELSE LEAST(id1, id2)
              END
            ELSE NULL
          END AS id_to_delete
        FROM pairs
      )
      DELETE FROM parceiros
      WHERE id IN (
        SELECT id_to_delete FROM to_delete WHERE id_to_delete IS NOT NULL
      );
    `;

    // 👇 Aqui especificamos <any> apenas para satisfazer o tipo genérico exigido
    const result: QueryResult<any> = await connectAndQuery(sqlCommand);

    console.log(`🧹 Registros duplicados removidos: ${result.rowCount ?? 0}`);

    return true;
  } catch (error) {
    console.error('Erro ao remover registros duplicados:', error);
    return false;
  }
};

export const getAllUser = async (offset: number, limit: number): Promise<Partner[]> => {
  const sqlCommand = `SELECT * FROM parceiros LIMIT $1 OFFSET $2`;
  const params = [limit, offset];
  
  const result = await connectAndQuery<Partner>(sqlCommand, params);

  return result.rows; // Retorna os dados paginados
};

export const getById = async (id: string): Promise<Partner | null> => {
  const query = 'SELECT * FROM parceiros WHERE id = $1';
  const data: QueryResult<Partner> = await connectAndQuery(query, [id]);
  return data.rows.length > 0 ? data.rows[0] : null;
};

export const getPartnersByParams = async (
  params: SearchPartnerFilter
): Promise<PartnerResponse> => {
  let baseQuery = 'FROM parceiros WHERE 1=1';
  const queryParams: (string | Date)[] = [];

  // Filtros de texto
  if (params.partnerFilter.nome) {
    baseQuery += ' AND nome ILIKE $' + (queryParams.length + 1);
    queryParams.push(`%${params.partnerFilter.nome}%`);
  }

  if (params.partnerFilter.numero_contato) {
    baseQuery += ' AND numero_contato ILIKE $' + (queryParams.length + 1);
    queryParams.push(`%${params.partnerFilter.numero_contato}%`);
  }

  if (params.partnerFilter.nome_ong_pertece) {
    baseQuery += ' AND nome_ong_pertece ILIKE $' + (queryParams.length + 1);
    queryParams.push(`%${params.partnerFilter.nome_ong_pertece}%`);
  }

  if (params.partnerFilter.profissao_ocupacao) {
    baseQuery += ' AND profissao_ocupacao ILIKE $' + (queryParams.length + 1);
    queryParams.push(`%${params.partnerFilter.profissao_ocupacao}%`);
  }

  if (params.partnerFilter.tipo) {
    baseQuery += ' AND tipo = $' + (queryParams.length + 1);
    queryParams.push(params.partnerFilter.tipo);
  }

  if (params.partnerFilter.origem) {
    baseQuery += ' AND tipo = $' + (queryParams.length + 1);
    queryParams.push(params.partnerFilter.origem);
  }

  if (params.partnerFilter.cidade) {
    baseQuery += ' AND cidade ILIKE $' + (queryParams.length + 1);
    queryParams.push(`%${params.partnerFilter.cidade}%`);
  }

  if (params.partnerFilter.estado) {
    baseQuery += ' AND estado ILIKE $' + (queryParams.length + 1);
    queryParams.push(`%${params.partnerFilter.estado}%`);
  }

  // Filtros de data (convertendo para YYYY-MM-DD de forma segura e usando DATE() no PG)
  if (params.partnerFilter.data_associacao_incio) {
    const startDate = new Date(params.partnerFilter.data_associacao_incio);
    if (!isNaN(startDate.getTime())) {
      baseQuery += ' AND DATE(data_associacao) >= $' + (queryParams.length + 1);
      queryParams.push(startDate.toISOString().split('T')[0]);
    }
  }

  if (params.partnerFilter.data_associacao_fim) {
    const endDate = new Date(params.partnerFilter.data_associacao_fim);
    if (!isNaN(endDate.getTime())) {
      baseQuery += ' AND DATE(data_associacao) <= $' + (queryParams.length + 1);
      queryParams.push(endDate.toISOString().split('T')[0]);
    }
  }

  if (params.partnerFilter.data_nascimento_inicio) {
    const birthStart = new Date(params.partnerFilter.data_nascimento_inicio);
    if (!isNaN(birthStart.getTime())) {
      baseQuery += ' AND DATE(data_nascimento) >= $' + (queryParams.length + 1);
      queryParams.push(birthStart.toISOString().split('T')[0]);
    }
  }

  if (params.partnerFilter.data_nascimento_fim) {
    const birthEnd = new Date(params.partnerFilter.data_nascimento_fim);
    if (!isNaN(birthEnd.getTime())) {
      baseQuery += ' AND DATE(data_nascimento) <= $' + (queryParams.length + 1);
      queryParams.push(birthEnd.toISOString().split('T')[0]);
    }
  }

  // Consulta de contagem
  const countQuery = `SELECT COUNT(*) AS row_count ${baseQuery}`;
  const countResult: QueryResult<{ row_count: number }> = await connectAndQuery(countQuery, queryParams);
  const totalRecords = countResult.rows[0].row_count;

  // Paginação
  const offset = (params.page - 1) * params.limit;
  const dataQuery = `SELECT * ${baseQuery} ORDER BY nome ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
  queryParams.push(params.limit.toString(), offset.toString());

  console.log('SQL:', dataQuery);
  console.log('Parâmetros:', queryParams);
  const dataResult: QueryResult<Partner> = await connectAndQuery(dataQuery, queryParams);

  // Calculando idade
  const today = new Date();
  const partnersWithAge = dataResult.rows.map((partner) => {
    const birthDate = new Date(partner.data_nascimento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const hasBirthdayPassed =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
    if (!hasBirthdayPassed) age--;
    return { ...partner, idade: age };
  });

  return {
    partners: partnersWithAge,
    row_count: totalRecords
  };
};

export const create = async (partner: Partner): Promise<Partner> => {
  const query = `
    INSERT INTO parceiros (numero_contato, nome, email, data_nascimento, nome_ong_pertece, data_associacao, cidade, estado, profissao_ocupacao, tipo)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;`;
  const data: QueryResult<Partner> = await connectAndQuery(query, [
    partner.numero_contato,
    partner.nome,
    partner.email,
    partner.data_nascimento,
    partner.nome_ong_pertece,
    partner.data_associacao,
    partner.cidade,
    partner.estado,
    partner.profissao_ocupacao,
    partner.tipo,
    partner.origem,
  ]);

  return data.rows[0];
};

export const update = async (partner: Partner): Promise<Partner> => {
  const query = `
    UPDATE parceiros 
    SET numero_contato = $1, nome = $2, email = $3, data_nascimento = $4, nome_ong_pertece = $5, data_associacao = $6, cidade = $7, estado = $8, profissao_ocupacao = $9, tipo = $10
    WHERE id = $11
    RETURNING *;`;
  const data: QueryResult<Partner> = await connectAndQuery(query, [
    partner.numero_contato,
    partner.nome,
    partner.email,
    partner.data_nascimento,
    partner.nome_ong_pertece,
    partner.data_associacao,
    partner.cidade,
    partner.estado,
    partner.profissao_ocupacao,
    partner.tipo,
    partner.id,
    partner.origem,
  ]);

  return data.rows[0];
};

export const partnerDelete = async (id: string): Promise<Partner | null> => {
  const query = 'DELETE FROM parceiros WHERE id = $1 RETURNING *';
  const data: QueryResult<Partner> = await connectAndQuery(query, [id]);
  return data.rows.length > 0 ? data.rows[0] : null;
};

