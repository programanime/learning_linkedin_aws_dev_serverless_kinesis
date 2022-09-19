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
    if(typeof(event) == "string"){
      console.log("whole event");
      console.log(event);

      event = JSON.parse(event);
    }

    

    console.log("the event is : ");
    console.log(event);
    console.log("creating an order");
    const orderManager = require('./orderManager');

    console.log("body  : ");
    console.log(event.body);

    const body = event.body || JSON.parse(event.body);
    const order = orderManager.createOrder(body);

    return orderManager.placeNewOrder(order).then(() => {
      console.log("order created");
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
    console.log("event");
    console.log(event);

    const orderManager = require('./orderManager');
    const body = event.body || JSON.parse(event.body);
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

module.exports.notificationOrders = async (kinesisEvent) => {
  try{
    console.log("notificationOrders method init");
    const kinesisHelper = require('./kinesisHelper');
    const cakeProducerManager = require('./cakeProducerManager');
    
    let records = []
    try{
      records = kinesisHelper.getRecords(kinesisEvent);
    }catch(e){
      records = kinesisEvent;
    }
    
    console.log("records");
    console.log(JSON.stringify(records));

    const ordersPlaced = records.filter(r => r.eventType === 'order_placed');
    const ordersFulfilled = records.filter(r => r.eventType === 'order_fulfilled');

    if(ordersPlaced.length <= 0 && ordersFulfilled.length <= 0){
      return "there is nothing";
    }else{
      console.log("there is something");
    }
    const deliveryPromises = getDeliveryPromise(records);

    console.log("delivery promises are ok");
    console.log(deliveryPromises);

    return Promise.all([
      cakeProducerManager.handlePlacedOrders(records),
      cakeProducerManager.handleFulfilledOrders(records),
      deliveryPromises
    ]).then(() => {
      return createResponse(200, "ok");  
    }).catch(error => {
      return createResponse(400, error);  
    });
  }catch(error){
    return createResponse(500, error.stack);
  }
}

module.exports.notifyDeliveryCompany = (event) => {
  console.log("the process is successful");
  return "done";
}

function getDeliveryPromise(records) {
  console.log("va a intentar enviar la orden");
  const orderFulfilled = records;
  var deliveryOrder=require("./deliveryOrder");
  if (orderFulfilled.length > 0) {
    const promise =  deliveryOrder.deliveryOrder(orderFulfilled);
    console.log("envio la orden");
    return promise;
  } else {
    return null;
  }
}


module.exports.orderDelivered = async (event) => {
  const body = event.body || JSON.parse(event.body);
  const { orderId, deliveryCompanyId }  = body;
  const orderReview = body.orderReview;
  var deliveryOrder=require("./deliveryOrder");
  return deliveryOrder.orderDelivered(orderId, deliveryCompanyId, orderReview).then(() => {
      return createResponse(200, `order with ${orderId} was delivered successfully by ${deliveryCompanyId}`);
  }).catch(error => createResponse(400, error));
}

module.exports.notifyCustomerService = async (event) => {
  console.log("lets image we call customer service endpoint");   
}