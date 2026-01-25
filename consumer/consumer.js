const amqp=require("amqplib");

const RABBITMQ_URL="amqp://user:password@rabbitmq:5672";
const LOG_QUEUE="log_queue";

async function connectWithRetry() {
    try {
        console.log("Consumer connecting...");
        const conn=await amqp.connect(RABBITMQ_URL);
        const channel=await conn.createChannel();

        await channel.assertQueue(LOG_QUEUE);
        console.log("Waiting for log...");
        
        channel.consume(LOG_QUEUE,(log)=>{
            if(log){
                console.log("Receive log: "+log.content.toString());
                channel.ack(log);
            }
        })
    } catch (error) {
        console.log("Consumer retry in 3s");
        setTimeout(connectWithRetry,3000);
    }
}

connectWithRetry()