import Kafka from 'node-rdkafka';

/*
 * The events entry point
 */
export async function run_kafka(): Promise<Kafka.Producer> {

    const host = process.env.IS_LOCAL ? 'localhost:29092' : 'kafka:9092';
    const producer = new Kafka.Producer({
        'metadata.broker.list': host,
        'client.id': 'sales-api-producer',
        event_cb: true,
    });
    producer
        .on('ready', () => {
            console.log('Sales API Producer is ready');
        })
        .on('event.error', function(e: any) {
            console.log('Sales API Producer Error');
            console.log(e);
        });
    await connect_async(producer);

    return producer;
}

/*
 * A utility to enable an async await style of coding
 */
async function connect_async(
    client: Kafka.Client<any>,
    optionsParam: Kafka.MetadataOptions | undefined = undefined): Promise<Kafka.Metadata> {

    const options = optionsParam || {timeout: 5000};
    return new Promise((resolve, reject) => {

        client.connect(options, (err, data) => {

            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}
