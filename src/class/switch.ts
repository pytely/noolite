// (c) Алексей Телятников
var lightsw: Array<Switch> = []

class Switch {
	id: number
	private _state: boolean

	constructor(id: number, state) {
		this.id = id
		this.state = state
//		if (state === 'ON') this._state = true
//		if (state === 'OFF') this._state = false
//		if (state) {this._state = true} else {this._state = false}
	}

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

	/* getter(): boolean { return this._state }

	setter(state) {
		if (state === 'ON') this._state = true
		if (state === 'OFF') this._state = false
		if (state) {this._state = true} else {this._state = false}
	}*/
}

function setsw (id: number, state) {
	if (lightsw[id]) {	lightsw[id].state = state }
	else { lightsw[id] = new Switch(id, state) }
}

function getsw (id: number) {	return lightsw[id] ? lightsw[id].state : false }

// export {lightsw, Switch}
export { lightsw, Switch, setsw, getsw}
