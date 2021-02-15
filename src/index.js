const AWS = require("aws-sdk");
const { v4: uuid } = require("uuid");
AWS.config.apiVersions = { dynamodb: "2012-08-10" };
const documentClient = new AWS.DynamoDB.DocumentClient({
  region: "eu-west-1",
});

exports.handler = async (event) => {
  let message = {};
  let putParams = {};
  let updateParams = {};
  let getOrDeleteParams = {};
  let book;
  let bookid;
  let response = {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    },
  };
  if (event.queryStringParameters && event.queryStringParameters.bookid) {
    bookid = event.queryStringParameters.bookid;
    getOrDeleteParams = {
      TableName: "Books",
      Key: { bookid },
    };
  }
  if (event.body) {
    book = JSON.parse(event.body);
  }
  /* switch to this for local testing */
  /*  if (event.body) {
    book = event.body;
  } */

  response.headers["Access-Control-Allow-Methods"] = event.httpMethod;

  switch (event.httpMethod) {
    case "POST":
      if (book && book.title && book.author && book.pubdate) {
        putParams = {
          TableName: "Books",
          Item: {
            bookid: uuid(),
            title: book.title,
            author: book.author,
            pubdate: parseInt(book.pubdate),
          },
        };
        try {
          await documentClient.put(putParams).promise();
          message = "SUCCESS";
          response.statusCode = 200;
        } catch (err) {
          message = err;
          response.statusCode = 400;
        }
      } else {
        response.statusCode = 400;
        message = "missing query parameters";
      }
      break;
    case "DELETE":
      if (bookid) {
        try {
          await documentClient.delete(getOrDeleteParams).promise();
          response.statusCode = 200;
          message = "SUCCESS";
        } catch (err) {
          message = err;
          console.log(err);
          response.statusCode = 500;
        }
      } else {
        response.statusCode = 400;
        message = "missing query parameters";
      }
      break;
    case "GET":
      // get one single book
      try {
        if (bookid) {
          const res = await documentClient.get(getOrDeleteParams).promise();
          if (res && res.Item) {
            message = res.Item;
          }
        } // get all the books (not practical when you have many books)
        else {
          const scanParams = { TableName: "Books" };
          const res = await documentClient.scan(scanParams).promise();
          if (res && res.Items && res.Items.length > 0) {
            message = res.Items;
          }
        }
        response.statusCode = 200;
      } catch (err) {
        message = err;
        console.log(err);
        response.statusCode = 500;
      }
      break;
    case "PATCH":
      if (bookid && book) {
        updateParams = {
          TableName: "Books",
          Key: { bookid: bookid },
          UpdateExpression: "set title = :t, author = :a, pubdate = :pd",
          ExpressionAttributeValues: {
            ":t": book.title,
            ":a": book.author,
            ":pd": parseInt(book.pubdate),
          },
        };
        try {
          await documentClient.update(updateParams).promise();
          response.statusCode = 200;
          message = "UPDATED";
        } catch (err) {
          message = err;
          console.log(err);
          response.statusCode = 500;
        }
      } else {
        response.statusCode = 400;
        message = "missing query parameters";
      }
      break;
    default:
      message = `Unsupported HTTP method ${event.httpMethod}`;
      response.statusCode = 400;
      break;
  }
  response.body = JSON.stringify({ message });
  return response;
};
