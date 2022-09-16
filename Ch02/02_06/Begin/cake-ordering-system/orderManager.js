'use strict'

const uuidv1 = require('uuid/v1');
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.orderTableName;

module.export.createOrder = body => {
    const order = {
        orderId: uuidv1(),
        name: body.name,
        address: body.address,
        productId: body.productId,
        quantity: body.quantity,
        orderDate: Date.now(),
        eventType: 'order_placed'
    }

    return order;
}

module.export.placeNewOrder = order => {
    // save order in table
    saveNewOrder(order).then(() => {
        
    })
    // put order stream
}

function saveNewOrder(order) {
    const params = {
        TableName: TABLE_NAME,
        Item: order
    }

    return dynamo.put(param).promise()
}