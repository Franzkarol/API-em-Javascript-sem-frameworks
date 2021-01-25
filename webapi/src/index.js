const http = require('http')
const PORT = 3000
const DEFAULT_HEADER = { 'Content-Type': 'application/json'}
const HeroFactory = require('./factories/heroFactory')
const heroService = HeroFactory.generateInstance()
const Hero = require('./entities/hero')

const routes = {
  '/heroes:get': async (request, response) => {
    const { id } = request.queryString
    const heroes = await heroService.find(id)
    response.write(JSON.stringify({ results: heroes }))

    return response.end()
  },
  '/heroes:post': async (request, response) => {
    //async iterator
    for await (const data of request ){
    try {
      const item = JSON.parse(data)
      const hero = new Hero(item)
      const { error, valid } = hero.isValid()
      if(!valid) {
        response.writeHead(400, DEFAULT_HEADER)
        response.write(JSOn.stringify({ error: error.join(',') }))
        return response.end()
      }

      const id = await heroService.create(hero)
      response.writeHead(201, DEFAULT_HEADER)
      response.write(JSON.stringify({ sucess: 'User Created with sucess!!', id }))

      //só jogamos o return aqui, pois sabemos que é um objeto body por requisicao
      // se fosse um arquivo, que sobe sob demanda
      // ele poderia entrar mais vezes em um mesmo evento, ai removeriamos o return
      return response.end()
    }
  },
  default: (request, response) => {
    response.write('Hello!')
    response.end()
  }
}

const error => {
  console.error('Deu ruim!***, error')
  response.writeHead(500, DEFAULT_HEADER)
  response.write(JSON.stringify({ error: 'Internal Server Error!!'}))

  return response.end()
}

const handler = (request, response) => {
  const { url, method } = request 
//  const [first, route, id] = url.split('/')
//  console.log('route', id)
//  console.log('id', id)
const [first, route, id] = url.split('/')
request.queryString = { id: isNaN(id) ? id : Number(id) }

const key = `/${route}:${method.toLowerCase()}`

response.writeHead(200, DEFAULT_HEADER)
// console.log('key', key) 

const chosen = routes[key] || routes.default
return chosen(request, response).catch(handlerError(response))
}

http.createServer(handler)
  .listen(PORT, () => console.log('server running at', PORT))