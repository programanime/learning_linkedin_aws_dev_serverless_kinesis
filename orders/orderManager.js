'use strict'

const uuid = require('uuid');
const AWS = require('aws-sdk');
AWS.config.update({region:process.env.region});


const dynamo = new AWS.DynamoDB.DocumentClient();
const kinesis = new AWS.Kinesis();

const TABLE_NAME = process.env.orderTableName;
const STREAM_NAME = process.env.orderStreamName

module.exports.createOrder = body => {
    const order = {
        orderId: uuid.v1(),
        name: body.name,
        address: body.address,
        productId: body.productId,
        quantity: body.quantity,
        orderDate: Date.now(),
        eventType: 'order_placed'
    }

    return order;
}

module.exports.placeNewOrder = order => {
    return this.saveOrder(order).then(() => {
        return placeOrderStream(order)
    })
}

module.exports.fulfillOrder = (orderId, fulfillmentId) => {
    return getOrderById(orderId).then(savedOrder => {
        const order = createFulfillmentOrder(savedOrder.Item, fulfillmentId);
        order.orderId = orderId;
        order.eventType = 'order_fulfilled';
        return this.saveOrder(order).then(() => {
            console.log("la orden guardada tiene");
            console.log(order);
            return placeOrderStream(order)
        });
    }).catch(error => {
        console.log("error consultando la orden");
        console.log(error);
    });
}

function createFulfillmentOrder(savedOrder, fulfillmentId){
    savedOrder.fulfillmentId = fulfillmentId;
    savedOrder.fulfillmentDate = Date.now();
    savedOrder.eventType = 'order_fulfilled';

    return savedOrder;
}

function getOrderById(orderId){
    const params = {
        Key: {
            orderId: orderId
        },
        TableName: TABLE_NAME
    };

    console.log("the params are : ");
    console.log(params);

    return dynamo.get(params).promise();
}

// getOrderById("d6b6c570-377f-11ed-9599-8f25c6af26b2").then(console.log).catch(console.log);

module.exports.saveOrder = (order) => {
    const params = {
        TableName: TABLE_NAME,
        Item: order
    }

    return dynamo.put(params).promise()
}

function placeOrderStream(order) {
    const params = {
        Data: JSON.stringify(order),
        PartitionKey: order.orderId,
        StreamName: STREAM_NAME
    }

    return kinesis.putRecord(params).promise();
}

module.exports.updateOrderForDelivery = (orderId) => {
    console.log("va a o obtener la roden 2.1");
    console.log(orderId);
    return getOrderById(orderId).then((order) => {
        console.log("obtuvo la orden");
        console.log(order);
        order = order.Item;
        order.sentToDeliveryDate = Date.now();
        return order;
    }).catch((err) => {
        console.log("error");
        console.log(err);
    }).finally(() => {
        console.log("finalizo el proceso de la orden");
        console.log("finalizo el proceso de la ordne al tratar de obtenerla desde dynamo");
    });
}


module.exports.updateOrderAfterDelivery = (orderId, deliveryCompanyId) => {
    return getOrderById(orderId).then((order) => {
        order = order.Item;
        order.deliveryCompanyId = deliveryCompanyId;
        order.deliveryDate =  Date.now();
        return order;
    })
}