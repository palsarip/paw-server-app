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
    const queriedUser = message.from;
    
    let userExists = null;

    for (let i = 0; i < userList.length; i++) {
      if (userList[i].from === queriedUser) {
        userExists = true;
        break; // No need to continue once the user is found
      }
    }
    
    console.log("queriedUser:", queriedUser);

    console.log("userExists:", userExists);
    
    if(!userExists){
      console.log('user not exist');
      userList.push({
        message: message.text.body,
        chatWithPAW: false, 
        from: message.from, 
      });
    }else{
      console.log('user chatted before');
      console.log(userList); 
    }
    
    

    res.sendStatus(200);
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.sendStatus(500);
  }
});

console.log('userlist',userList);



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
