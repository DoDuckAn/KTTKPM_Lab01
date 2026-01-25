const amqp=require("amqplib");

const RABBITMQ_URL="amqp://user:password@rabbitmq:5672";
const LOG_QUEUE="log_queue";
const ERROR_LOG_QUEUE="error_log_queue";

async function connectWithRetry() {
    try {
        console.log("Consumer connecting...");
        const conn=await amqp.connect(RABBITMQ_URL);
        const channel=await conn.createChannel();

        await channel.assertQueue(ERROR_LOG_QUEUE,{durable:true});
        await channel.assertQueue(LOG_QUEUE,{
            durable:true,
            deadLetterExchange:"",
            deadLetterRoutingKey:ERROR_LOG_QUEUE
        });
        console.log("Waiting for log...");
        
        channel.consume(LOG_QUEUE,async(log)=>{
            if(!log){
                return;
            }

            const body=log.content.toString();
            console.log("Processing: "+body);
            
            try {
                const data=JSON.parse(body);

                if(!data.deviceID){
                    throw new Error("Missing deviceID");
                }

                await new Promise((resolve=>setTimeout(resolve,3000)));

                console.log("Process success");
                channel.ack(log);
            } catch (error) {
                console.error("Send to Error_log_queue:"+error.message);
                channel.nack(log,false,false);
            }
        },
        {noAck:false}
        );
    } catch (error) {
        console.log("Consumer retry in 3s");
        setTimeout(connectWithRetry,3000);
    }
}

connectWithRetry()