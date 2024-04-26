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
  OPENAI_ASSISTANT_ID,
} = process.env;

/* Variables */

let userList = [
  {
    message: "",
    chatWithPAW: false,
    threadId: "",
    from: "",
  },
];

let pollingInterval;

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

async function createThread() {
  try {
    console.log("Creating a new thread...");

    const response = await axios({
      method: "POST",
      url: "https://api.openai.com/v1/threads",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v2",
      },
    });

    return response.data.id;
  } catch (error) {
    throw error;
  }
}

async function addMessage(threadId, message) {
  try {
    console.log("Adding a new message to thread: " + threadId);

    const response = await axios({
      method: "POST",
      url: `
https://api.openai.com/v1/threads/${threadId}/messages`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v2",
      },
      data: {
        role: "user",
        content: message,
      },
    });
    return response.data.content[0].text.value;
  } catch (error) {
    throw error;
  }
}

async function runAssistant(threadId) {
  try {
    console.log("Running assistant for thread: " + threadId);

    const response = await axios({
      method: "POST",
      url: `
https://api.openai.com/v1/threads/${threadId}/runs`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v2",
      },
      data: {
        assistant_id: OPENAI_ASSISTANT_ID,
      },
    });
    // console.log("runAssistant ID in function: ", response.data.id);

    return response.data.id;
  } catch (error) {
    throw error;
  }
}

async function checkingStatus(res, threadId, runId) {
  try {
    console.log("Masuk checkingStatus()");

    const runObject = await axios({
      method: "GET",
      url: `
https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v2",
      },
    });

    const status = runObject.data.status;
    console.log("Current status: " + status);

    if (status == "completed") {
      console.log("Masuk status completed");

      clearInterval(pollingInterval);

      const messagesList = await axios({
        method: "GET",
        url: `https://api.openai.com/v1/threads/${threadId}/messages`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v2",
        },
      });

      // if (
      //   messagesList.data
      //   // messagesList.data.length > 0 &&
      //   // messagesList.data[0].content &&
      //   // messagesList.data[0].content.length > 0
      // ) {
      //   console.log(messagesList.data[0].role);
      //   // console.log(messagesList.data[0].content[0].text.value);
      // } else {
      //   console.log("No message content found.");
      // }
      
      console.log("")

            let messages = [];

           // messagesList.data.foreach((message) => {
           //   messages.push(message.content);
           // }); 
      
      console.log("messages: ", messages)

      res.json({ messages });
    }
  } catch (error) {
    throw error;
  }
}

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

        const userPrompt = message?.text.body;

        //         addMessage(userData.threadId, userPrompt).then((userPrompt) => {
        //           runAssistant(userData.threadId).then((run) => {
        //             const runId = run.id;

        //             pollingInterval = setInterval(() => {
        //               checkingStatus(res, userData.threadId, runId);
        //             }, 5000);
        //           });
        //         });

        const addMessageValue = await addMessage(userData.threadId, userPrompt);
        console.log("addMessage: ", addMessageValue);

        const runAssistantId = await runAssistant(userData.threadId);
        console.log("runAssistant ID: ", runAssistantId);

        pollingInterval = setInterval(() => {
          checkingStatus(res, userData.threadId, runAssistantId);
        }, 5000);

        // const checkingStatusValue = await checkingStatus(res, userData.threadId, runAssistantId)
        //  console.log("checkingStatusValue: ", checkingStatusValue);
      }

      if (message?.type === "interactive") {
        const buttonReplyId =
          req.body.entry[0].changes[0].value.messages[0].interactive
            .button_reply.id;

        console.log("Button ID:", buttonReplyId);

        if (buttonReplyId === "CHAT_WITH_PAW") {
          userData.chatWithPAW = true;
          userData.threadId = await createThread();
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
