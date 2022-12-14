'use strict';

const orderManager = require('./orderManager');
const kinesisHelper = require('./kinesisHelper');
const cakeProducerManager = require('./cakeProducerManager');

function createResponse(statusCode, message) {
  const response = {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };

  return response;
}

module.exports.createOrder = async (event) => {

  const body = JSON.parse(event.body);
  const order = orderManager.createOrder(body);

  return orderManager.placeNewOrder(order).then(() => {
    return createResponse(200, order);
  }).catch(error => {
    return createResponse(400, error);
  })
};

module.exports.orderFulfillment = async (event) => {
  const body = JSON.parse(event.body);
  const orderId = body.orderId;
  const fulfillmentId = body.fulfillmentId;

  return orderManager.fulfillOrder(orderId, fulfillmentId).then(() => {
    return createResponse(200, `Order with orderId:${orderId} was sent to delivery`);
  }).catch(error => {
    return createResponse(400, error);
  })
}

module.exports.notifyCakeProducer = async (event) => {
  const records = kinesisHelper.getRecords(event);

  const ordersPlaced = records.filter(r => r.eventType === 'order_placed');

  if (ordersPlaced <= 0) {
    return 'there is nothing';
  }

  return cakeProducerManager.handlePlacedOrders(ordersPlaced).then(() => {
    return 'the email was sent'
  }).catch(error => {
    console.log(error);
    return error
  })
}