//% weight=0 color=#CCB72C icon="\uf14e" block="SensorBag"
namespace mooncar {
	let IR_Send_port = 1
	export enum Port {
		//% block="P0"
		Port1 = 1,
		//% block="P1"
		Port2 = 2,
		//% block="P2"
		Port3 = 3,
		//% block="P8"
		Port4 = 4,
		//% block="P16"
		Port5 = 5
	}
	
	//%block="Enable IR %change"
	export function EnIR(change: Port = 1) :void{
		if (change == 1) {
			pins.onPulsed(DigitalPin.P0, PulseValue.Low, function () {
				readir.push(pins.pulseDuration())
			})
			pins.onPulsed(DigitalPin.P0, PulseValue.High, function () {
				readir.push(pins.pulseDuration())
			})
			pins.setEvents(DigitalPin.P0, PinEventType.Pulse)
			pins.setPull(DigitalPin.P0, PinPullMode.PullUp)
		}
		else if (change == 2) {
			pins.onPulsed(DigitalPin.P1, PulseValue.Low, function () {
				readir.push(pins.pulseDuration())
			})
			pins.onPulsed(DigitalPin.P1, PulseValue.High, function () {
				readir.push(pins.pulseDuration())
			})
			pins.setEvents(DigitalPin.P1, PinEventType.Pulse)
			pins.setPull(DigitalPin.P1, PinPullMode.PullUp)
		}
		else if (change == 3) {
			pins.onPulsed(DigitalPin.P2, PulseValue.Low, function () {
				readir.push(pins.pulseDuration())
			})
			pins.onPulsed(DigitalPin.P2, PulseValue.High, function () {
				readir.push(pins.pulseDuration())
			})
			pins.setEvents(DigitalPin.P2, PinEventType.Pulse)
			pins.setPull(DigitalPin.P2, PinPullMode.PullUp)
		}
		else if (change == 4) {
			pins.onPulsed(DigitalPin.P8, PulseValue.Low, function () {
				readir.push(pins.pulseDuration())
			})
			pins.onPulsed(DigitalPin.P8, PulseValue.High, function () {
				readir.push(pins.pulseDuration())
			})
			pins.setEvents(DigitalPin.P8, PinEventType.Pulse)
			pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
		}
		else {
			pins.onPulsed(DigitalPin.P16, PulseValue.Low, function () {
				readir.push(pins.pulseDuration())
			})
			pins.onPulsed(DigitalPin.P16, PulseValue.High, function () {
				readir.push(pins.pulseDuration())
			})
			pins.setEvents(DigitalPin.P16, PinEventType.Pulse)
			pins.setPull(DigitalPin.P16, PinPullMode.PullUp)
		}		
	}
	
	let readir: number[] = []
	readir = []
	let Pnumber = 0
	let IRREAD: Action;
	let Reading = false
	control.inBackground(function () {
		basic.forever(function () {
			if (Reading == true) {
				if (readir[0] > 30000) {
					basic.pause(100)
					let count = 0
					let one_data = 0
					for (let i = 0; i < readir.length; i++) {
						if (readir[i] > 1000 && readir[i] < 2000) {
							count += 1
						}
						if (count == 8) {
							one_data = i + 2
							break
						}
					}
			
					Pnumber = 0
					for (let i = 0; i < 8; i++) {
						if (readir[one_data] > 1000) {
							Pnumber += (1 << (7 - i))
						}
						one_data += 2
					}
					basic.pause(50)
					readir = []
					if (Reading) {
						IRREAD()
					}
				}
				else {
					readir = []
				}
			}
		})
	})

	//%block="IR Read"
	export function IRRead(): number {
		return Pnumber
	}

	//%block="IR Remote(NEC)" blockInlineInputs=true
	//%weight=80 blockGap=10
	export function IRRemote(add: Action): void {
		IRREAD = add
		Reading = true
	}

	function IRon(d: number) {
		if (IR_Send_port == 1) {
			let r = d;
			while (r > 26) {
				pins.digitalWritePin(DigitalPin.P0, 1)
				control.waitMicros(2);
				pins.digitalWritePin(DigitalPin.P0, 0)
				r = r - 26;
			}
		}
		else if (IR_Send_port == 2) {
			let r = d;
			while (r > 26) {
				pins.digitalWritePin(DigitalPin.P1, 1)
				control.waitMicros(2);
				pins.digitalWritePin(DigitalPin.P1, 0)
				r = r - 26;
			}
		}
		else if (IR_Send_port == 3) {
			let r = d;
			while (r > 26) {
				pins.digitalWritePin(DigitalPin.P2, 1)
				control.waitMicros(2);
				pins.digitalWritePin(DigitalPin.P2, 0)
				r = r - 26;
			}
		}
		else if (IR_Send_port == 4) {
			let r = d;
			while (r > 26) {
				pins.digitalWritePin(DigitalPin.P8, 1)
				control.waitMicros(2);
				pins.digitalWritePin(DigitalPin.P8, 0)
				r = r - 26;
			}
		}
		else {
			let r = d;
			while (r > 26) {
				pins.digitalWritePin(DigitalPin.P16, 1)
				control.waitMicros(2);
				pins.digitalWritePin(DigitalPin.P16, 0)
				r = r - 26;
			}
		}
		
	}
	
	function IRoff(d: number) {
		control.waitMicros(d);
	}
	
	function send(code: number) {
		for (let i = 7; i > -1; i--) {
			if (1 << i & code) {
				IRon(560);
				IRoff(1600);
			} else {
				IRon(560);
				IRoff(560);
			}
		}
	}
	
	function recode(code: number): number {
		let message = 0
		for (let i = 7; i > -1; i--) {
			if (!(1 << i & code)) {
				message += (1 << i)
			}
		}
		return message
	}
	
	//%block="IR Send(NEC) %change| %irnumber|(0~255)"
	export function IRcommand(change: Port = 1, irnumber: number) :void{
		IR_Send_port = change
		let irnumber2 = recode(irnumber)
		IRon(8500);
		IRoff(4500);
		send(0);
		send(255);
		send(irnumber);
		send(irnumber2);
		IRon(560);
		IRoff(4500);
	}
}




