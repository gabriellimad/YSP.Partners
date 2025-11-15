import axios from "axios";
import { notFound } from "../status/status";
import { Municipio } from "../helpers/interfaces/ysIBGEobject";

const IBGE_URL = process.env.IBGE_URL as string;

export const getCitiesByStateId = async (id: number): Promise<{ id: number; nome: string }[]> => {
    const ibgeResponse = await getIbgeUFs(id);
  
    if (!ibgeResponse) throw notFound;
  
    const simplifiedCitys = ibgeResponse.map(municipio => ({
      id: municipio.id,
      nome: municipio.nome
    }));
  
    return simplifiedCitys;
};

export async function getIbgeUFs(uF: number): Promise<Municipio[]> {
    const url = IBGE_URL.replace('uF',uF.toString());
    try {
        const response = await axios.get<Municipio[]>(url);
        return response.data;
      } catch (error) {
        console.error("Erro ao buscar os municípios", error);
        throw error;
      }
}

export default {
  getCitiesByStateId,
    getIbgeUFs,
};