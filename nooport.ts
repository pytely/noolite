import * as SerialPort from 'serialport'

const template = [171, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 172]
var mtrf = []
//------------------------------------------------------------------------------
class NooPort {
  name: string
  port: string
  busy: boolean = false
  busyCounter: number = 0
  serport
  // Конструктор
  constructor(name: string, port: string) {
    this.name = name // Имя MTRF-64, как мы его будем показывать
    this.port = port // Адрес последовательного порта вида '/dev/ttyUSB0'
    this.connect()
  }
  //---------- Установка соединения с со Свистком по COM порту -----------------
  connect() {
    if (this.serport != undefined) {
      return;
    }
    this.serport = new SerialPort(this.port,
	     { baudRate: 9600,
	       parser: SerialPort.parsers.byteLength(17)
       })
    if (this.serport) {
      this.serport.on("data", (resp) => {
        console.log("Serdata:" + Uint8Array.from(resp));
      })
      this.serport.on("error", (resp) => {
        console.log("SerError:");
        console.log(resp);
      })
      let cmnd = [171, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 172];
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
  command(addr:number, command:number) {
    let cmnd = WriteCmnd(addr, command)
    this.send(cmnd)
  }
  //------------ Выклбчить свет ------------------------------------------------
  off(addr:number) {
    console.log('off')
    let cmnd = WriteCmnd(addr, 0)
    this.send(cmnd)
  }
  //------------ Включить свет -------------------------------------------------
  on(addr:number) {
    console.log('on')
    let cmnd = WriteCmnd(addr, 2)
    this.send(cmnd)
  }
  //------------- Переключение света -------------------------------------------
  toggle(addr:number) {
    let cmnd = WriteCmnd(addr, 4)
    this.send(cmnd)
  }
  //------------- Привязка к выключателю ---------------------------------------
  bind(addr:number) {
    let cmnd = WriteCmnd(addr, 15)
    this.send(cmnd)
  }
  //-------------- Активация режима привязки -----------------------------------
  activate(addr:number) {
    let cmnd = ActivateCmnd(addr)
    this.send(cmnd)
  }
  //-------------- вызов отправки команды в MTRF-64 ----------------------------
  send(cmnd) {
   send(this, cmnd)
  }
}
//-------------- Отправка команды в MTRF-64 ------------------------------------
function send(noo, cmnd) {
  if (noo.serport != undefined && noo.serport.isOpen()) {
    if (noo.busyCounter > 3) noo.busy = false
    console.log(noo.busy)
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
      console.log("Buffer:" + buffer)
      noo.busy = true
      if (error) {
        console.log("Serial write error: "+ error)
      }
    });
    noo.serport.drain( (error) => {
      noo.busy = false
      if (error) {
        console.log("Serial drain error: "+ error)
      }
    })
  }
}
export  { NooPort, mtrf }
//------------- Команда управления нагрузкой -----------------------------------
// 0  - выключить
// 2  - включить
// 4  - переключить
// 15 - привязать
function WriteCmnd(addr:number, command:number):Array<number> {
  let cmnd = template.slice()
  let i:number

  cmnd[4] = +addr
  cmnd[5] = +command
  for (i=0; i<15; i++) { cmnd[15] += cmnd[i] }
  return cmnd
}
//---------- Команда режим актвации привязки  ----------------------------------
function ActivateCmnd(addr:number):Array<number> {
  let cmnd = template.slice()
  let i:number

  cmnd[2] = 3
  cmnd[4] = +addr
  for (i=0; i<15; i++) { cmnd[15] += cmnd[i] }
  return cmnd
}
