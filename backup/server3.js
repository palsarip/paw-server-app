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

let userList = [
  {
    message: "",
    chatWithPAW: false,
    from: "",
  },
];

/* Functions */

const chatWithAi = async (message) => {
  try {
    console.log("ini udah masuk ke ai");
    const initialFetchedAIData = await axios({
      method: "POST",
      url: `https://api.openai.com/v1/chat/completions`,
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      data: {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: "say hi back",
          },
        ],
        temperature: 0.7,
      },
    });
    console.log(initialFetchedAIData);
    return initialFetchedAIData;
  } catch (error) {
    console.log("error dari function chatWithAi: ", error.message);
  }
};

const welcome = async (message, business_phone_number_id, yangMauDikirim) => {
  try {
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v${CLOUD_API_VERSION}/${business_phone_number_id}/messages`,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
      },
      data: {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: message?.from ?? "WhatsApp User",
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            // text: `Halo, ${message.from}! Saya PAW, asisten virtual Anda di WhatsApp. Saya siap membantu Anda dengan berbagai pertanyaan dan tugas apa pun. Bagaimana saya dapat membantu Anda hari ini?`,
            text: yangMauDikirim,
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: { id: "GAMES", title: "Games 🕹️" },
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
        message_id: message?.id,
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
        message_id: message?.id,
      },
    });
  } catch (error) {
    console.log("error dari welcome function: ", error.message);
  }
};

const debug_ke_gilbert = async (
  message,
  business_phone_number_id,
  yangMauDikirim
) => {
  try {
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v${CLOUD_API_VERSION}/${business_phone_number_id}/messages`,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
      },
      data: {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: "085217775787" ?? "WhatsApp User",
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: yangMauDikirim,
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: { id: "GAMES", title: "Games 🕹️" },
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
        message_id: message?.id,
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
        message_id: message?.id,
      },
    });
  } catch (error) {
    console.log(" debug error gilbert: ", error.message);
  }
};

app.post("/webhook", async (req, res) => {
  try {
    const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
    const business_phone_number_id =
      req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;
    const queriedUser = message?.from;

    let userExists = null;
    let userData;

    for (let i = 0; i < userList.length; i++) {
      if (userList[i].from === queriedUser) {
        userData = userList[i];
        userExists = true;
        break;
      }
    }

    if (!userExists) {
      console.log("user not exist");
      userList.push({
        message: message?.text.body,
        chatWithPAW: false,
        from: message?.from,
      });
      welcome(message, business_phone_number_id, "welcome jink");
    } else {
      if (userData.chatWithPAW) {
        const AIrespond = chatWithAi(message?.text.body);
        const initialFetchedAIData = await axios({
          method: "POST",
          url: `https://api.openai.com/v1/chat/completions`,
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          data: {
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: message?.text.body,
              },
            ],
            temperature: 0.7,
          },
        })
          .then((res) => {
            welcome(
              message,
              business_phone_number_id,
              initialFetchedAIData.data.choices[0].message.content
            );
          })
          .catch((error) => {
            debug_ke_gilbert(message, business_phone_number_id, error.message)
          });
      }

      if (message?.type === "interactive") {
        const buttonReplyId =
          req.body.entry[0].changes[0].value.messages[0].interactive
            .button_reply.id;

        if (buttonReplyId === "CHAT_WITH_PAW") {
          userData.chatWithPAW = true;
          welcome(
            message,
            business_phone_number_id,
            "kamu akan chat dengan PAW, ad yang bisa dibantu?"
          );
        }
      }
    }

    console.log("\n end of loop \n");

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
