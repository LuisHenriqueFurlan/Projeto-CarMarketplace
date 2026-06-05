import { ValidationError } from '../../errors/errors'

const BASE_URL = 'https://parallelum.com.br/fipe/api/v1'

async function fipeFetch(path: string) {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new ValidationError(`Erro ao consultar FIPE: ${path}`)
  return res.json()
}

export class FipeService {
  async getMarcas(tipo: string) {
    return fipeFetch(`/${tipo}/marcas`)
  }

  async getModelos(tipo: string, codMarca: string) {
    return fipeFetch(`/${tipo}/marcas/${codMarca}/modelos`)
  }

  async getAnos(tipo: string, codMarca: string, codModelo: string) {
    return fipeFetch(`/${tipo}/marcas/${codMarca}/modelos/${codModelo}/anos`)
  }

  async getPreco(tipo: string, codMarca: string, codModelo: string, codAno: string) {
    return fipeFetch(`/${tipo}/marcas/${codMarca}/modelos/${codModelo}/anos/${codAno}`)
  }
}

export const fipeService = new FipeService()
