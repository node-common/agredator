/**
 * ---------------------------------------------------------------------------------------------------
 */
import {AggredatorResult, AgredatorConfiguration, AgredatorJobConfiguration} from "../index";
import {StandardHelper} from "../helpers/standard.helper";

export class StandardRunner {

    public job: AgredatorJobConfiguration<any> = null;

    private conf: AgredatorConfiguration = null;

    constructor(conf: AgredatorConfiguration,
                job: AgredatorJobConfiguration<any>) {

        this.conf = conf;
        this.job = job;

    }

    /**
     * Run aggregator job
     * ---------------------------------------------------------------------------------------------------
     * @returns {Promise<AggredatorResult>}
     */
    public run() : Promise<AggredatorResult> {

        return new Promise<AggredatorResult>((resolve, reject) => {

            let iterations = 0;

            let iterator = 0;

            const output: AggredatorResult = {
                results: {},
                time: 0,
                errors: []
            };

            const helper = new StandardHelper(this.conf.threads);

            helper.toDo = this.job.data.length;

            const iv = setInterval(() => {

                // console.log(helper);
                // console.log(this.job.data);
                /*
                 *  Work on resolving main result
                 */

                if(helper.isCompleted() || helper.isStopped()) {

                    clearInterval(iv);

                    output.results = helper.sequences;

                    resolve(output);

                }

                /*
                 *  Await queue execution if all threads are busy
                 */

                if(helper.isBlocking())

                    return;

                /*
                 *  Prevent further aggregation if it should be timed out
                 */

                if(helper.aggregate && output.time > this.conf.timeout)

                    helper.stopAggregatoion();

                /*
                 *  Work on threaded execution
                 */

                let currentData = null;

                if(iterator < this.job.data.length) {

                    currentData = this.job.data[iterator++];

                    /*
                     *  If aggregation is allowed then proceed with
                     *  attached executors
                     */

                    if(helper.aggregate) {

                        const name = currentData.name;
                        const executor = currentData.callback;
                        const input = currentData.input;

                        executor(input)
                            .then((data) => {

                                helper.addSequence(name, data);

                                helper.receive();

                            })
                            .catch(err => {

                                output.errors.push({
                                    message: err.message,
                                    code: err.hasOwnProperty("code") ? err.code : 400
                                });

                                helper.receive();

                            });

                        helper.send();

                    }

                }

                /*
                 *  Apply iterations and timing
                 */

                if(iterations > 0)

                    output.time += this.conf.pollInterval;

                iterations++;

            }, this.conf.pollInterval);

        });

    }

}