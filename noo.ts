// (c) Алексей Телятников
import * as http from 'http'
import * as bodyParser from 'body-parser' 	// модуль разборки апросов
import * as express from 'express' 		// Продвинутый сервер для http запросов
import { NooPort, mtrf}  from './nooport' //
import * as rest from './rest'

try {
	mtrf[0] = new NooPort('MTRF','/dev/ttyS1')
	console.log(mtrf[0])
	console.log(mtrf[0].port)
// Блок обработки запросов к нашему серверу
	var app = express()
	var router = express.Router()
	app.use('/', router)
	router.use(bodyParser.json()) 			// все multipart req.body в json
	router.use('/mtrf', rest.router)

// Блок запуска http сервера
	var httpServer = http.createServer(app)		// для обработки http
	console.log("Запуск веб серверов")
	httpServer.listen(8125)			//   http  на 8125
} catch (err) {
	console.log('Error: ' + err.message)
}
