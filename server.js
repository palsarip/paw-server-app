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

app.post("/webhook", async (req, res) => {
  try {
    console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));

    const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];

    switch (chatWithPAW) {
        case (chatWithPAW === true): 
        console.log("chatWithPAW", chatWithPAW)
      default:
        const business_phone_number_id =
          req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;

        await axios({
          method: "POST",
          url: `https://graph.facebook.com/v${CLOUD_API_VERSION}/${business_phone_number_id}/messages`,
          headers: {
            Authorization: `Bearer ${GRAPH_API_TOKEN}`,
          },
          data: {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: message.from ?? "WhatsApp User",
            type: "interactive",
            interactive: {
              type: "button",
              body: {
                text: `Halo, ${message.from}! Saya PAW, asisten virtual Anda di WhatsApp. Saya siap membantu Anda dengan berbagai pertanyaan dan tugas apa pun. Bagaimana saya dapat membantu Anda hari ini?`,
              },
              action: {
                buttons: [
                  {
                    type: "reply",
                    reply: {
                      id: "GAMES",
                      title: "Games 🕹️",
                    },
                  },
                  {
                    type: "reply",
                    reply: {
                      id: "CHAT_WITH_PAW",
                      title: "Chat with PAW 🤖",
                    },
                  },
                  // {
                  //   type: "reply",
                  //   reply: {
                  //     id: "LIVE_CHAT",
                  //     title: "Live Chat",
                  //   },
                  // },
                ],
              },
            },
          },
          context: {
            message_id: message.id,
          },
        });

        await axios({
          method: "POST",
          url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
          headers: {
            Authorization: `Bearer ${GRAPH_API_TOKEN}`,
          },
          data: {
            messaging_product: "whatsapp",
            status: "read",
            message_id: message.id,
          },
        });
        break;
      case chatWithPAW === true:
        console.log("chatWithPAW", chatWithPAW);
    }

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
