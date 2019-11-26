//% weight=0 color=#CCB72C icon="\uf14e" block="SensorBag"
namespace mooncar {
	//%block="Enable IR"
	export function EnIR() :void{
		pins.onPulsed(DigitalPin.P1, PulseValue.Low, function () {
			readir.push(pins.pulseDuration())
		})
		pins.onPulsed(DigitalPin.P1, PulseValue.High, function () {
			readir.push(pins.pulseDuration())
		})
		
		pins.setEvents(DigitalPin.P1, PinEventType.Pulse)
		pins.setPull(DigitalPin.P1, PinPullMode.PullUp)
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
		let r = d;
		while (r > 26) {
			pins.digitalWritePin(DigitalPin.P6, 1)
			control.waitMicros(2);
			pins.digitalWritePin(DigitalPin.P6, 0)
			r = r - 26;
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
	
	//%block="IR Send(NEC) %irnumber|(0~255)"
	export function IRcommand(irnumber: number) :void{
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




