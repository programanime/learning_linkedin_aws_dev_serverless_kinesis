'use strict'

const AWS = require("aws-sdk");
const ses = new AWS.SES({
    region: process.env.region
});

const CAKE_PRODUCER_EMAIL = process.env.cakeProducerEmail;
const ORDERING_SYSTEM_EMAIL = process.env.orderingSystemEmail;

module.exports.handlePlacedOrders = ordersPlaced => {
    const ordersPlacedPromises = [];
    for(let order of ordersPlaced){
        const temp = notifyCakeProducerByEmail(order);
        ordersPlacedPromises.push(temp);
    }
    return Promise.all(ordersPlacedPromises);
}

module.exports.handleFulfilledOrders = ordersFulfilled => {
    const ordersFulfilledPromises = [];
    for(let order of ordersFulfilled){
        const temp = notifyCakeFulfilledByEmail(order);
        ordersFulfilledPromises.push(temp);
    }
    return Promise.all(ordersFulfilledPromises);
}

function notifyCakeFulfilledByEmail(order){
    return sendNotification(order, ORDERING_SYSTEM_EMAIL, ORDERING_SYSTEM_EMAIL, "Order fulfilled");
}

function notifyCakeProducerByEmail(order){
    return sendNotification(order, CAKE_PRODUCER_EMAIL, ORDERING_SYSTEM_EMAIL, "New order placed");
}

function sendNotification(order, to, from, message){
    const params = {
        Destination: {
            ToAddresses: [to]
        },
        Message: {
            Body: {
                Text: {
                    Data: JSON.stringify(order)
                }
            },
            Subject: {
                Data: message
            }
        },
        Source: from
    };

    return ses.sendEmail(params).promise().then((data) => {
        return data;
    });
}