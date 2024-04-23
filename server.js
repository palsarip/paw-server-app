/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const {
  WEBHOOK_VERIFY_TOKEN,
  GRAPH_API_TOKEN,
  PORT,
  CLOUD_API_VERSION,
  OPENAI_API_KEY,
} = process.env;

/* Variables */
let chatWithPAW = false;

let userList = [
  {
    message: "",
    chatWithPAW: null,
    from:""
  },
];

app.post("/webhook", async (req, res) => {
  try {

    const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
    const user = message.from;
    
    //check user is exist in json or not with "from"
    
    if(!user exist in userList){
      userList.push({
        message: message.text.body,
        chatWithPAW: false, 
        from: message.from, 
      });
    }
    
    
    
    
    
    //if "from" has same data with any data inside json
    
    //if new user, append json
    
    //if user has messaged before, default reply, but dont append json


    res.sendStatus(200);
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.sendStatus(500);
  }
});






app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
    console.log("Webhook verified successfully!");
  } else {
    res.sendStatus(403);
  }
});

app.get("/", (req, res) => {
  res.send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
