import type { FastifyRequest, FastifyReply } from 'fastify'
import { fipeService } from './fipe.service'
import { ValidationError } from '../../errors/errors'

const TIPOS_VALIDOS = ['carros', 'motos', 'caminhoes']

function validarTipo(tipo: string) {
  if (!TIPOS_VALIDOS.includes(tipo))
    throw new ValidationError(`Tipo inválido. Use: ${TIPOS_VALIDOS.join(', ')}`)
}

export class FipeController {
  async getMarcas(request: FastifyRequest, reply: FastifyReply) {
    const { tipo } = request.params as { tipo: string }
    validarTipo(tipo)
    const data = await fipeService.getMarcas(tipo)
    return reply.send({ success: true, data })
  }

  async getModelos(request: FastifyRequest, reply: FastifyReply) {
    const { tipo, codMarca } = request.params as { tipo: string; codMarca: string }
    validarTipo(tipo)
    const data = await fipeService.getModelos(tipo, codMarca)
    return reply.send({ success: true, data })
  }

  async getAnos(request: FastifyRequest, reply: FastifyReply) {
    const { tipo, codMarca, codModelo } = request.params as {
      tipo: string
      codMarca: string
      codModelo: string
    }
    validarTipo(tipo)
    const data = await fipeService.getAnos(tipo, codMarca, codModelo)
    return reply.send({ success: true, data })
  }

  async getPreco(request: FastifyRequest, reply: FastifyReply) {
    const { tipo, codMarca, codModelo, codAno } = request.params as {
      tipo: string
      codMarca: string
      codModelo: string
      codAno: string
    }
    validarTipo(tipo)
    const data = await fipeService.getPreco(tipo, codMarca, codModelo, codAno)
    return reply.send({ success: true, data })
  }
}

export const fipeController = new FipeController()
