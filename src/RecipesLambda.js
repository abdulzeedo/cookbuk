const AWS = require("aws-sdk");
const express = require("express");
const serverless = require("serverless-http");
const dynamodb = require('serverless-dynamodb-client');
const crypto = require('crypto');

const app = express();

const RECIPES_TABLE = process.env.RECIPES_TABLE;

const dynamoDbClient = dynamodb.doc;

app.use(express.json());

app.get("/recipes", async function (req, res) {
  const params = {
    TableName: RECIPES_TABLE,
  };

  try {
    const {Items : recipes} = await dynamoDbClient.scan(params).promise();
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
