// (c) Алексей Телятников
import * as http from 'http'
import * as bodyParser from 'body-parser' 	// модуль разборки апросов
import * as express from 'express' 		// Продвинутый сервер для http запросов
import * as rest from './src/router/rest'
import { params } from './src/etc/params'

var httpport = params.httpport

try {
//	console.log(mtrf[0])
//	console.log(mtrf[0].port)
// Блок обработки запросов к нашему серверу
	var app = express()
	var router = express.Router()
	app.use('/', router)
	router.use(bodyParser.json()) 			// все multipart req.body в json
	router.use('/mtrf', rest.router)

// Блок запуска http сервера
	var httpServer = http.createServer(app)		// для обработки http
	console.log('Запуск сервера Noolite на порту ' + httpport)
	httpServer.listen(httpport)
} catch (err) {
	console.log('Error: ' + err.message)
}
