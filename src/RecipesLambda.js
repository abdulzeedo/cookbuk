const AWS = require("aws-sdk");
const express = require("express");
const serverless = require("serverless-http");
const dynamodb = require('serverless-dynamodb-client');
const crypto = require('crypto');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

const app = express();
app.use(awsServerlessExpressMiddleware.eventContext());


const RECIPES_TABLE = process.env.RECIPES_TABLE;

const dynamoDbClient = dynamodb.doc;

app.use(express.json());

function getUserID(req, res, next) {
  req.userId = req?.apiGateway?.event?.requestContext?.authorizer?.claims?.['cognito:username'];
  console.log(req.userId);
  next();
}
app.use(getUserID);
app.get("/recipes", async function (req, res) {
  // console.log(getUserID());
  const params = {
    TableName: RECIPES_TABLE,
    IndexName: "userIndex",
    KeyConditionExpression: "#u_id = :id",
    ExpressionAttributeNames:{
      "#u_id": "userId"
    },
    ExpressionAttributeValues: {
        ":id": "google_113200800594518319852"
    }
  };
  console.log(params);
  try {
    const {Items : recipes} = await dynamoDbClient.query(params).promise();
    if (recipes) {
      res.json( recipes );
      console.log(recipes);
    } else {
      res
        .status(404)
        .json({ error: 'Could not find any recipes"' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retreive the recipes" });
  }
});
app.post("/recipes", async function (req, res) {
    const recipe = req.body;
    const uuid = crypto.randomUUID();
    const params = {
      TableName: RECIPES_TABLE,
      Item: {
          recipeId: uuid,
          userId: req.userId,
          ...recipe
      },
    };
    console.log(params);
    try {
      await dynamoDbClient.put(params).promise();
      res.json({ uuid });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Could not create a new recipe" });
    }
  });
app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});


module.exports.handler = serverless(app);
