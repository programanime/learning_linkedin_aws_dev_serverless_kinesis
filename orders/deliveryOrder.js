'use strict'

var orderManager=require("./orderManager");

const AWS=require("aws-sdk");
const sqs = new AWS.SQS({
    region: process.env.region
})

const DELIVERY_QUEUE_URL = process.env.deliveryQueueUrl;

module.exports.deliveryOrder = ordersFulfilled => {
    const orderFulfilledPromises = [];
    for(let order of ordersFulfilled){
        console.log("va a actualizar la orden para delivery");
        const temp = orderManager.updateOrderForDelivery(order.orderId).then((updatedOrder) => {
            console.log("orden actualizada");
            orderManager.saveOrder(updatedOrder).then(() => {
                console.log("save order finish");
                notifyDeliveryCompany(updatedOrder);
            });
        });

        orderFulfilledPromises.push(temp);
    }

    return Promise.all(orderFulfilledPromises);
}

function notifyDeliveryCompany(order){
    // const params = {MessageBody: JSON.stringify({id:100}),QueueUrl: DELIVERY_QUEUE_NAME};
    // var para = {MessageBody: JSON.stringify({id:100}),QueueUrl: "https://sqs.us-east-1.amazonaws.com/987940999793/deliveryServiceQueue"};
    const params = {MessageBody: JSON.stringify(order),QueueUrl: DELIVERY_QUEUE_URL};

    const promise = sqs.sendMessage(params).promise();
    console.log("enviado a la cola");
    return promise;
}

module.exports.orderDelivered = (orderId, deliveryCompanyId, orderReview) => {
    var customerServiceManager=require("./customerServiceManager");
    return orderManager.updateOrderAfterDelivery(orderId, deliveryCompanyId).then((updatedOrder) => {
        return orderManager.saveOrder(updatedOrder).then(() => {
            return customerServiceManager.notifyCustomerServiceForReview(orderId, orderReview);
        });
    });
}