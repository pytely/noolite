// (c) Алексей Телятников
var lightsw: Array<Switch>

class Switch {
	id: number
	state: boolean

	constructor(id: number, state) {
		this.id = id
		if (state === 'ON') this.state = true
		if (state === 'OFF') this.state = false
		if (state) {this.state = true} else {this.state = false}
	}

	getter(): boolean {
		return this.state
	}

	setter(state) {
		if (state === 'ON') this.state = true
		if (state === 'OFF') this.state = false
		if (state) {this.state = true} else {this.state = false}
	}
}

function setsw (id: number, state) {
	if (lightsw[id]) {	lightsw[id].setter(state) }
	else { lightsw[id] = new Switch(id, state) }
}

function getsw (id: number) {
	if (lightsw[id]) return lightsw[id].getter()
	return false
}

export {setsw, getsw}
