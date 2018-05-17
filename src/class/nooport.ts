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
    if (this.serport != undefined) { return }
    this.serport = new SerialPort(this.port,
	     { baudRate: baudrate, parser: SerialPort.parsers.byteLength(17) } )
    if (this.serport) {
      // this.serport.on("data", (resp) => { return })
      this.serport.on("error", (resp) => {
        console.log("SerError:");
        console.log(resp);
      })
      let cmnd = [171, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 172]
      let buffer = Uint8Array.from(cmnd)
      this.serport.write(buffer, (error) => {
        this.busy = true
        if (error) {
          console.log("Write error: "+ error)
        }
      })
      this.serport.drain( (error) => {
        this.busy = false
        if (error) {
          console.log("Drain error: "+ error)
        }
      })
    }
    else {
      console.log("Cannot open " + this.port)
    }
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
//-------------- Отправка команды в MTRF-64 ------------------------------------
function send(noo: NooPort, cmnd: Array<number>) {
  if (noo.serport && noo.serport.isOpen()) {
    if (noo.busyCounter > 3) noo.busy = false
    console.log('busy = ' + noo.busy)
    if (noo.busy) {
      setTimeout(send, 1000, noo, cmnd)
      noo.busyCounter++
      return
    }
    else {
      noo.busyCounter = 0
    }
    const buffer = Uint8Array.from(cmnd)
    noo.serport.write(buffer, (error) => {
      noo.busy = true
      if (error) console.log('Serial write error: ' + error)
    })
    noo.serport.drain( (error) => {
      if (error) console.log('Serial drain error: ' + error)
      noo.busy = false
    })
  }
}
//------------- Команда управления нагрузкой -----------------------------------
// 0  - выключить
// 2  - включить
// 4  - переключить
// 15 - привязать
function WriteCmnd(addr:number, command:number): Array<number> {
  let cmnd = template.slice()

  cmnd[4] = +addr
  cmnd[5] = +command
  for (let i=0; i<15; i++) { cmnd[15] += cmnd[i] }
  return cmnd
}
//---------- Команда режим актвации привязки  ----------------------------------
function ActivateCmnd(addr:number): Array<number> {
  let cmnd = template.slice()

  cmnd[2] = 3
  cmnd[4] = +addr
  for (let i=0; i<15; i++) { cmnd[15] += cmnd[i] }
  return cmnd
}

var mtrf: NooPort = new NooPort('MTRF', serport)

export  { NooPort, mtrf }
