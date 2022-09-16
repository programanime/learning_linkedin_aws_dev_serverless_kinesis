'use strict';

const orderManager = require("./orderManager");

function createResponse(statusCode, message){
  const response = {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };
  return response;
}

// module.exports.createOrder = async (event) => {
//   return {
//     statusCode: 200,
//     body: JSON.stringify({
//       message: 'Create order!',
//       input: event,
//     }),
//   };

//   const body =  JSON.parse(event.body);
//   const order = orderManager.createOrder(body);

//   return orderManager.placeNewOrder(order).then(() => {
//     return createResponse(200, order);
//   }).catch((err) => {
//     return createResponse(400, error);
//   });
// };

module.exports.createOrder = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully test 2!',
        input: event,
      },
      null,
      2
    ),
  };
};
