rabbitmq = Message Broker
producer = Gui message
consumer = Xu ly message

Các service giao tiếp qua network Docker


+----------+        +------------+        +-----------+
| Producer | -----> | RabbitMQ   | -----> | Consumer  |
+----------+        +------------+        +-----------+
                         Queue

curl -X POST http://localhost:3000/record \
  -H "Content-Type: application/json" \
  -d '{"message":"Open door"}'

curl -X POST http://localhost:3000/record \
-H "Content-Type: application/json" \
-d '{"deviceID":"ESP01","message":"Open door"}'