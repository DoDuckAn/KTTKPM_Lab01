const express=require("express");
const amqp=require("amqplib");

const app=express();
app.use(express.json());

const RABBITMQ_URL = "amqp://user:password@rabbitmq:5672";
const LOG_QUEUE = "log_queue";
const ERROR_LOG_QUEUE="error_log_queue";

let channel;
async function connectRabbitMQ(p) {
    while(true){
        try {
            const conn=await amqp.connect(RABBITMQ_URL);
            channel=await conn.createChannel();
            await channel.assertQueue(LOG_QUEUE,{
                durable:true,
                deadLetterExchange:"",
                deadLetterRoutingKey:ERROR_LOG_QUEUE
            });
            console.log("Producer connected to RabbitMQ");
            break;
        } catch{
            console.log("Waiting for RabbitMQ...");
            await new Promise((r)=>setTimeout(r,3000));
        }
    }
}

app.post("/record",async(req,res)=>{
    const {message,deviceID}=req.body;

    const data={
        deviceID:deviceID,
        message:message,
        timestamp:new Date()
    }

    channel.sendToQueue(
        LOG_QUEUE,
        Buffer.from(JSON.stringify(data)),
        {
            persistent:true
        }
    );

    console.log("Send to consumer:"+data);

    res.status(200).json({
        error:false,
        data:data,
    })
})

connectRabbitMQ();

app.listen(3000,()=>{
    console.log("Producer listening on port 3000");
})