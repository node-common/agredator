import {Exception} from "ts-exceptions";
import {StandardRunner} from "./drivers/standard.runner";

export class Agredator {

    /**
     * Create new job
     * ---------------------------------------------------------------------------------------------------
     * @param {AgredatorJobConfiguration<any>} config
     * @returns {StandardRunner}
     */
    public static create(config: AgredatorJobConfiguration<any>) : StandardRunner {

        Agredator.__checkOptions(config);

        return new StandardRunner(Agredator.__parseOptions(config), config);

    }

    /**
     * Parse System options from config
     * ---------------------------------------------------------------------------------------------------
     * @param {AgredatorJobConfiguration<AgredatorConfiguration>} o
     * @private
     */
    private static __parseOptions(o: AgredatorJobConfiguration<any>) : AgredatorConfiguration {

        const options: AgredatorConfiguration = {
            timeout: 10000,
            pollInterval: 20,
            threads: 4
        };

        if(o.hasOwnProperty("system")) {

            if(typeof o.system === "object") {

                if(o.system.hasOwnProperty("timeout")) {

                    const t = Number(o.system.timeout);

                    if(!isNaN(t))
                        options.timeout = t;

                }

                if(o.system.hasOwnProperty("pollInterval")) {

                    const p = Number(o.system.pollInterval);

                    if(!isNaN(p))
                        options.pollInterval = p;

                }

                if(o.system.hasOwnProperty("threads")) {

                    const t = Number(o.system.threads);

                    if(!isNaN(t))
                        options.threads = t;

                }

            }

        }

        return options;

    }

    /**
     * Check validity of options passed to Agredator
     * ---------------------------------------------------------------------------------------------------
     * @param {AgredatorJobConfiguration<any>} o
     * @private
     */
    private static __checkOptions(o: AgredatorJobConfiguration<any>) : void {

        for(const j of o.data) {

            if(typeof j.callback !== "function")

                throw new Exception("Agredator Exception: callback defined " +
                    "for " + j.name + " job is not a function type", 500);

        }

    }

}

export interface AgredatorJobConfiguration<T> {
    data: Array<AgredatorJob<T>>;
    system?: AgredatorConfiguration;
}

export interface AgredatorJob<T> {
    name: string;
    input: T;
    callback: (input: T) => Promise<any>;
}

export interface AgredatorConfiguration {
    timeout: number;
    pollInterval: number;
    threads: number;
}

export interface AggredatorResult {
    results: {[key: string] : Array<any>}
    time: number;
    errors: Array<AggredatorError>;
}

export interface AggredatorError {
    message: string;
    code: number;
}