import * as SerialPort from 'serialport'
import { params } from '../etc/params'
var serport = params.serport
var baudrate = params.baudrate
const template = [171, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 172]

//------------------------------------------------------------------------------
class NooPort {
  name: string
  port: string
  busy: boolean = false
  busyCounter: number = 0
  serport: SerialPort

  // Конструктор
  constructor(name: string, port: string) {
    this.name = name // Имя MTRF-64, как мы его будем показывать
    this.port = port // Адрес последовательного порта вида '/dev/ttyUSB0'
    this.connect()
  }
  //---------- Установка соединения с со Свистком по COM порту -----------------
  connect(): void {
    let cmnd = template.slice()

    if (this.serport != undefined) { return }
    this.serport = new SerialPort(this.port,
	     { baudRate: baudrate, parser: SerialPort.parsers.byteLength(17) } )
    if (this.serport) {
      this.serport.on('data', (resp) => {
        console.log('resp =' + JSON.stringify(nooArray(resp)))
        return
      })
      this.serport.on('error', (resp) => {
        console.log('SerError:')
        console.log(resp)
      })
      // let cmnd = [171, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 172]
      cmnd[1] = 4
      // checksum(cmnd) // для команды mode = 4 чексумму добовлять не нужно
      // cmnd[15] = 4
      const buffer = Uint8Array.from(cmnd)
      this.serport.write(buffer, (err) => {
        this.busy = true
        if (err) { console.log("Write error: "+ err) }
      })
      this.serport.drain( (err) => {
        this.busy = false
        if (err) { console.log("Drain error: "+ err) }
      })
    }
    else { console.log("Cannot open " + this.port) }
  }
  //------------------------------------------------------------------------------
  command(addr:number, command:number) { this.send(WriteCmnd(addr, command)) }
  //------------ Выклбчить свет ------------------------------------------------
  off(addr:number) { this.send(WriteCmnd(addr, 0)) }
  //------------ Включить свет -------------------------------------------------
  on(addr:number) { this.send(WriteCmnd(addr, 2)) }
  //------------- Переключение света -------------------------------------------
  toggle(addr:number) { this.send(WriteCmnd(addr, 4)) }
  //------------- Привязка к выключателю ---------------------------------------
  bind(addr:number) { this.send(WriteCmnd(addr, 15)) }
  //-------------- Активация режима привязки -----------------------------------
  activate(addr:number) { this.send(ActivateCmnd(addr)) }
  //-------------- вызов отправки команды в MTRF-64 ----------------------------
  send(cmnd: Array<number>) { send(this, cmnd) }
}
function nooArray(resp) { return resp.splice() }
//-------------- Отправка команды в MTRF-64 ------------------------------------
function send(noo: NooPort, cmnd: Array<number>) {
  if (noo.serport && noo.serport.isOpen()) {
    if (noo.busyCounter > 5) noo.busy = false
    console.log('busy = ' + noo.busy)
    if (noo.busy) {
      setTimeout(send, 200, noo, cmnd)
      noo.busyCounter++
      return
    }
    else { noo.busyCounter = 0 }

    const buffer = Uint8Array.from(cmnd)
    noo.serport.write(buffer, (error) => {
      noo.busy = true
      if (error) console.log('Serial write error: ' + error)
    })
    noo.serport.drain( (error) => {
      noo.busy = false
      if (error) console.log('Serial drain error: ' + error)
    })
  }
}
//------------------------------------------------------------------------------
function checksum(cmnd): void {
  for (let i=0; i<15; i++) cmnd[15] += cmnd[i]
  cmnd[15] = cmnd[15] & 0xFF
}
//------------- Команда управления нагрузкой -----------------------------------
// 0  - выключить
// 2  - включить
// 4  - переключить
// 15 - привязать
function WriteCmnd(addr:number, command:number, fm?: boolean): Array<number> {
  let cmnd = template.slice()

  if (fm) {
    cmnd[1] = 1
  }
  cmnd[4] = Number(addr)
  cmnd[5] = Number(command)
  checksum(cmnd)
  // for (let i=0; i<15; i++) { cmnd[15] += cmnd[i] }
  return cmnd
}
//---------- Команда режим актвации привязки  ----------------------------------
function ActivateCmnd(addr:number): Array<number> {
  let cmnd = template.slice()

  cmnd[2] = 3
  cmnd[4] = Number(addr)
  checksum(cmnd)
  // for (let i=0; i<15; i++) { cmnd[15] += cmnd[i] }
  return cmnd
}

var mtrf: NooPort = new NooPort('MTRF', serport)

export  { NooPort, mtrf }
