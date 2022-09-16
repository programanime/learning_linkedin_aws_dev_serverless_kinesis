'use strict';

function createResponse(statusCode, message) {
  const response = {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };

  return response;
}

module.exports.createOrder = async (event) => {
  try{
    const orderManager = require('./orderManager');
    const body = JSON.parse(event.body);
    const order = orderManager.createOrder(body);

    return orderManager.placeNewOrder(order).then(() => {
      return createResponse(200, order);
    }).catch(error => {
      return createResponse(400, error);
    })
  }catch(error){
    return createResponse(500, error.stack);
  }
};


module.exports.fulfillOrder  = async (event) => {
  try{
    const orderManager = require('./orderManager');
    const body = JSON.parse(event.body);
    const {orderId, fulfillmentId} = body;
    

    return orderManager.fulfillOrder(orderId, fulfillmentId).then(() => {
      return createResponse(200, `order with orderId : ${orderId} was sent to delivery`);
    }).catch(error => {
      return createResponse(400, error);
    })
  }catch(error){
    return createResponse(500, error.stack);
  }
}