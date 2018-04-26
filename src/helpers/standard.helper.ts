/**
 * ---------------------------------------------------------------------------------------------------
 */
export class StandardHelper {

    public toDo = 0;

    public started = false;
    public aggregate = true;
    public sent = 0;
    public received = 0;
    public maxThreads = 4;

    public sequences: {[key: string] : Array<any>} = {};
    public sequencesTotal = 0;

    constructor(threads = 4) {
        this.maxThreads = threads;
    }

    public isStopped() {

        return !this.aggregate;

    }

    public isCompleted() {

        return this.started && this.sent === this.received && this.received === this.toDo;

    }

    public isBlocking() {

        if(((this.sent - this.received) >= this.maxThreads) || !this.aggregate)

            return true;

        return false;

    }

    public send() {

        this.sent++;

        if(!this.started)

            this.started = true;

    }

    public receive() {

        this.received++;

    }

    public stopAggregatoion() {

        this.aggregate = false;

    }

    public addSequence(sequenceId: string, value: Array<Object>) {

        if(!this.sequences.hasOwnProperty(sequenceId))
            this.sequences[sequenceId] = [];

        this.sequences[sequenceId] = this.sequences[sequenceId].concat(value);

    }

}