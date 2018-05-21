// (c) Алексей Телятников
import { NooPort, mtrf } from './nooport'
var lightsw: Array<Switch> = []

class Switch {
	id: number
	private _state: boolean
	private _fm: boolean

	constructor(id: number, state, fm?) {
		this.id = id
		this.state = state
		this.fm = fm || false
//		if (state === 'ON') this._state = true
//		if (state === 'OFF') this._state = false
//		if (state) {this._state = true} else {this._state = false}
	}

	get fm() { return this._fm }
	set fm(value: boolean) { this._fm = value}

	get state() {	return this._state }
	set state(value: any) {
		switch (value) {
			case 'ON':
			case 'on':
			case true:
			case 'ВКЛ':
			case 'вкл':
				this._state = true
				break
			case 'OFF':
			case 'off':
			case false:
			case 'ВЫКЛ':
			case 'выкл':
				this._state = false
				break
		}

	}
	on() {
		this.state = true
	}

	off() {
		this.state = false
	}
	/* getter(): boolean { return this._state }

	setter(state) {
		if (state === 'ON') this._state = true
		if (state === 'OFF') this._state = false
		if (state) {this._state = true} else {this._state = fal	}*/
}

function setsw (id: number, state) {
	if (lightsw[id]) {	lightsw[id].state = state }
	else { lightsw[id] = new Switch(id, state) }
}

function getsw (id: number) {	return lightsw[id] ? lightsw[id].state : false }

// export {lightsw, Switch}
export { lightsw, Switch, setsw, getsw}
