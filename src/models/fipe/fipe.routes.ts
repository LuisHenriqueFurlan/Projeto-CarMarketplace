import type { FastifyInstance } from 'fastify'
import { fipeController } from './fipe.controller'

export async function fipeRoutes(app: FastifyInstance) {
  app.get('/fipe/:tipo/marcas', (req, reply) => fipeController.getMarcas(req, reply))
  app.get('/fipe/:tipo/marcas/:codMarca/modelos', (req, reply) => fipeController.getModelos(req, reply))
  app.get('/fipe/:tipo/marcas/:codMarca/modelos/:codModelo/anos', (req, reply) => fipeController.getAnos(req, reply))
  app.get('/fipe/:tipo/marcas/:codMarca/modelos/:codModelo/anos/:codAno/preco', (req, reply) => fipeController.getPreco(req, reply))
}
