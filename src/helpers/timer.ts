import {Cell} from "@cmmn/cell";

export class Timer extends Cell<Date>{
    constructor(private interval: number) {
        super(new Date());
    }

    private intervalId: number | null = null;
    active() {
        super.active();
        this.intervalId = setInterval(() => {
            this.set(new Date());
        }, this.interval) as any;
    }

    protected disactive() {
        super.disactive();
        this.intervalId && clearInterval(this.intervalId);
    }
}