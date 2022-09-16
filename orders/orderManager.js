'use strict'

const uuid = require('uuid');
const AWS = require('aws-sdk');
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
    return saveOrder(order).then(() => {
        return placeOrderStream(order)
    })
}

module.exports.fulfillOrder = (orderId, fulfillmentId) => {
    return getOrderById(orderId).then(savedOrder => {
        const order = createFulfillmentOrder(savedOrder, fulfillmentId);
        order.orderId = orderId;
        return saveOrder(order).then(() => {
            return placeOrderStream(order)
        });
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

    return dynamo.get(params).promise();
}

function saveOrder(order) {
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