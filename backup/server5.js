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
      url: `https://graph.facebook.com/v${CLOUD_API_VERSION}/${business_phone_number_id}/messages`,
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

const openAIPrompt = async (message) => {
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
    console.log("error dari function chatWithPAW: ", error.message);
  }
};

const initialChatWithPAW = async (message, business_phone_number_id) => {
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
        type: "text",
        text: {
          preview_url: false,
          body: "Kamu akan diarahkan untuk chat dengan PAW 🤖",
        },
      },
      context: {
        message_id: message?.id,
      },
    });

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
            text: "Halo dengan PAW disini!, ada yang bisa aku bantu?\n\nSilahkan ketik apa yang mau dibicarakan",
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: { id: "STOP_CHAT_WITH_PAW", title: "Stop Chatting 🤖" },
              },
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
      url: `https://graph.facebook.com/v${CLOUD_API_VERSION}/${business_phone_number_id}/messages`,
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
    console.olg("error dari function initialChatWithPAW: ", error.message);
  }
};

const chatWithPAW = async (
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
        to: message?.from ?? "WhatsApp User",
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
                reply: { id: "STOP_CHAT_WITH_PAW", title: "Stop Chatting 🤖" },
              },
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
      url: `https://graph.facebook.com/v${CLOUD_API_VERSION}/${business_phone_number_id}/messages`,
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
    console.olg("error dari function initialChatWithPAW: ", error.message);
  }
};

const stopChatWithPAW = async (
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
        to: message?.from ?? "WhatsApp User",
        type: "text",
        text: {
          preview_url: false,
          body: "Semoga jawaban yang PAW berikan dapat membantu yaa! 😊",
        },
      },
      context: {
        message_id: message?.id,
      },
    });

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
            text: `Halo, ${message.from}! Saya PAW, asisten virtual Anda di WhatsApp. Saya siap membantu Anda dengan berbagai pertanyaan dan tugas apa pun. Bagaimana saya dapat membantu Anda hari ini?`,
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
      url: `https://graph.facebook.com/v${CLOUD_API_VERSION}/${business_phone_number_id}/messages`,
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
    console.olg("error dari function stopChatWithPAW: ", error.message);
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
      welcome(
        message,
        business_phone_number_id,
        `Halo, ${message?.from}! Saya PAW, asisten virtual Anda di WhatsApp. Saya siap membantu Anda dengan berbagai pertanyaan dan tugas apa pun. Bagaimana saya dapat membantu Anda hari ini?`
      );
    } else {
      if (userData.chatWithPAW) {
        let openAIThreadId = "";

        if (message?.type === "interactive") {
          const buttonReplyId =
            req.body.entry[0].changes[0].value.messages[0].interactive
              .button_reply.id;

          console.log("Button ID:", buttonReplyId);

          if (buttonReplyId === "STOP_CHAT_WITH_PAW") {
            userData.chatWithPAW = false;
            console.log("STOP_CHAT_WITH_PAW", userData.chatWithPAW);
            stopChatWithPAW(message, business_phone_number_id);
          }
        }

        const createOpenAIThread = await axios({
          method: "POST",
          url: `https://api.openai.com/v1/threads`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "OpenAI-Beta": "assistants=v2",
          },
          data: {
            messages: [
              {
                role: "user",
                content: message?.text.body,
              },
            ],
          },
        });
        console.log("createOpenAIThread:", createOpenAIThread.data.id);

        openAIThreadId = createOpenAIThread.data.id;

        // chatWithPAW(
        //   message,
        //   business_phone_number_id,
        //   fetchedAIData.data.choices[0].message.content
        // );

        const retrieveOpenAIThread = await axios({
          method: "GET",
          url: `https://api.openai.com/v1/threads/${openAIThreadId}`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "OpenAI-Beta": "assistants=v2",
          },
        });
        console.log("retrieveOpenAIThread:", retrieveOpenAIThread.data);

        const retrieveOpenAIThreadMessages = await axios({
          method: "GET",
          url: `https://api.openai.com/v1/threads/${openAIThreadId}/messages`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "OpenAI-Beta": "assistants=v2",
          },
        });
        console.log(
          "retrieveOpenAIThreadMessages:",
          retrieveOpenAIThreadMessages.data
        );

        const contentTextValues = [];

        retrieveOpenAIThreadMessages.data.data.forEach(message => {
            const textValue = message.content[0].text.value;
            contentTextValues.push(textValue);
          
          console.log("contentTextValues", contentTextValues)
        });

        return contentTextValues;
      }

      if (message?.type === "interactive") {
        const buttonReplyId =
          req.body.entry[0].changes[0].value.messages[0].interactive
            .button_reply.id;

        console.log("Button ID:", buttonReplyId);

        if (buttonReplyId === "CHAT_WITH_PAW") {
          userData.chatWithPAW = true;
          initialChatWithPAW(message, business_phone_number_id);
        }
      }
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
