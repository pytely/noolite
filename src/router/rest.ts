import * as express from 'express'
import { mtrf } from '../class/nooport'
import { lightsw, Switch, getsw, setsw } from '../class/switch'
import { headtxt } from '../etc/headers'
//------------------------------------------------------------------------------
// REST интерфейс к MTRF-64
var router = express.Router()

router.param('chnl', (req, res, next, chnl) => {
	req.chnl = chnl
	next()
})

router.param('value', (req, res, next, value) => {
	req.value = value
	next()
})

router.get('/state/:chnl?', (req, res) => {
//	console.log('staterouter ' + req.chnl);
	res.set(headtxt)
	if (req.chnl == undefined) {
		res.write('No channel defined')
		res.end()
		return
	}
	let state = getsw(req.chnl)
	let resp = {'id': req.chnl, 'state': state}
	res.write(JSON.stringify(resp))
	res.end()
	return
})

router.get('/off/:chnl?', (req, res) => {
//	console.log('offrouter ' + req.chnl)
	res.set(headtxt)
	if (req.chnl == undefined) {
		res.write('No channel defined')
		res.end()
		return
	}
	mtrf.off(req.chnl)
	setsw(req.chnl, false)
	res.write('Channel ' + req.chnl + ' is OFF\n')
	res.end()
	return
})

router.get('/on/:chnl?', (req, res) => {
//	console.log('onrouter ' + req.chnl);
	res.set(headtxt)
	if (req.chnl == undefined) {
		res.write('No channel defined')
		res.end()
		return
	}
	mtrf.on(req.chnl)
	setsw(req.chnl, true)
	res.write('Channel ' + req.chnl + ' is ON\n')
	res.end()
	return;
})

router.get('/toggle/:chnl?', (req, res) => {
	res.set(headtxt)
	if (req.chnl == undefined) {
		res.write('No channel defined')
		res.end()
		return
	}
	mtrf.toggle(req.chnl)
	getsw[req.chnl] ? setsw(req.chnl, false) : setsw(req.chnl, true)
	res.write('Channel ' + req.chnl + ' TOGGLED\n')
	res.end()
	return
})

router.get('/bind/:chnl?', (req, res) => {
	res.set(headtxt)
	if(req.chnl == undefined) {
		res.write('No channel defined')
		res.end()
		return
	}
	mtrf.bind(req.chnl)
	res.write('Press button to bind channel ' + req.chnl + '\n')
	res.write('or activate binding using /mtrf/activate/' + req.chnl + '\n')
	res.write('then send /mtrf/bind/' + req.chnl + '\n')
	res.write('to assign device for specific channel\n')
	res.write('and send /mtrf/bind/' + req.chnl + ' again\n')
	res.end()
	return;
});

router.get('/activate/:chnl?', (req, res) => {
	res.set(headtxt)
	if(req.chnl == undefined) {
		res.write('No channel defined')
		res.end()
		return
	}
	mtrf.activate(req.chnl)
	res.write('You can now bind channel ' + req.chnl + '\n')
	res.write('by sending /mtrf/bind/' + req.chnl + '\n')
	res.write('to assign another device for specific channel\n')
	res.write('and send /mtrf/bind/' + req.chnl + ' again\n')
	res.end()
	return
})

router.get('/:chnl?/:value?', (req, res) => {
	res.set(headtxt)
	if(req.chnl == undefined) {
		res.write('No channel defined\n')
		res.write('Use /mtrf/<channel>/<command> to control\n')
		res.write('or  /mtrf/bind/<channel> to bind\n')
		res.end()
		return
	}
	if(req.value == undefined) {
		res.write('No command defined for channel=' + req.chnl + '\n')
		res.write('Use /mtrf/' + req.chnl + '/<command> to control\n')
		res.write('or  /mtrf/bind/' + req.chnl + ' to bind\n')
		res.end()
		return
	}

	mtrf.command(req.chnl, req.value)
	res.write('Load control for ' + req.chnl + ' channel\n')
	res.end()
	return
});

export { router }
