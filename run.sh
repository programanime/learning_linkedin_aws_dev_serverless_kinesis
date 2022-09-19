echo {"body":{"name":"marcia","address":"somewhere","productId":"productIdd11","quantity":"10"}} > data.json & sls invoke local --function createOrder --path data.json
echo {"body":{"orderId":"0f7d6860-37a2-11ed-b388-a5ca24ca1795","fulfillmentId":"CakeProducer1"}} > data.json & sls invoke local --function fulfillOrder --path data.json
echo [{"orderId": "cbb0a580-37a0-11ed-b490-7561fe814e1e","orderDate": 1663539927000,"eventType": "order_fulfilled"}] > data.json & sls invoke local --function notificationOrders --path data.json
echo {"body":{"orderId":"cbb0a580-37a0-11ed-b490-7561fe814e1e","deliveryCompanyId":"1"}} > data.json & sls invoke local --function orderDelivered --path data.json
