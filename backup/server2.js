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

    if (message?.type === "text" && chatWithPAW === false) {
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
    } else if (message?.type === "text" && chatWithPAW === true) {
      console.log("ngobrol ama PAW");
    }

    if (message?.type === "interactive" && chatWithPAW === false) {
      const buttonReplyId =
        req.body.entry[0].changes[0].value.messages[0].interactive.button_reply
          .id;

      const business_phone_number_id =
        req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;

      if (buttonReplyId === "GAMES") {
        await axios({
          method: "POST",
          url: `https://graph.facebook.com/v${CLOUD_API_VERSION}/${business_phone_number_id}/messages`,
          headers: {
            Authorization: `Bearer ${GRAPH_API_TOKEN}`,
          },
          data: {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: message.from ?? "Whatsapp User",
            type: "interactive",
            interactive: {
              type: "button",
              body: {
                text: "Halo! Selamat datang di layanan chatbot kami. Saya adalah asisten virtual yang siap membantu Anda.\n\nUntuk memulai, pilih salah satu opsi di bawah ini: \n\n1. 🎮 MOBA \n2. 🔫 FPS \n\nSilakan ketik nomor yang sesuai dengan opsi yang Anda inginkan atau pilih dari tombol di bawah ini.",
              },
              action: {
                buttons: [
                  {
                    type: "reply",
                    reply: {
                      id: "MOBA",
                      title: "MOBA 🚩",
                    },
                  },
                  {
                    type: "reply",
                    reply: {
                      id: "FPS",
                      title: "FPS 🔫",
                    },
                  },
                  // {
                  //   type: "reply",
                  //   reply: {
                  //     id: "OPEN_WORLD",
                  //     title: "Lokasi 📍",
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
      } else if (buttonReplyId === "CHAT_WITH_PAW") {
        chatWithPAW = true;

        let initialAIMessage = "";

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
                content: "Halo, aku mau ngobrol sama kamu!",
              },
            ],
            temperature: 0.7,
          },
        });

        console.log(
          "fetched: ",
          initialFetchedAIData.data.choices[0].message.content
        );
        initialAIMessage = initialFetchedAIData.data.choices[0].message.content;

        await axios({
          method: "POST",
          url: `https://graph.facebook.com/v${CLOUD_API_VERSION}/${business_phone_number_id}/messages`,
          headers: {
            Authorization: `Bearer ${GRAPH_API_TOKEN}`,
          },
          data: {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: message.from ?? "Whatsapp User",
            type: "interactive",
            interactive: {
              type: "button",
              body: {
                text: initialAIMessage,
              },
              footer: {
                text: "Powered by ChatGPT-3.5",
              },
              action: {
                buttons: [
                  {
                    type: "reply",
                    reply: {
                      id: "STOP_CHAT_WITH_PAW",
                      title: "Berhenti ngobrol",
                    },
                  },
                ],
              },
            },
          },
          context: {
            message_id: message.id,
          },
        });

        while (chatWithPAW) {
          let userPromptMessage =
            req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
          let AIReplyMessage = "";

          const AIReplyFetchedData = await axios({
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
                  content: userPromptMessage,
                },
              ],
              temperature: 0.7,
            },
          });

          const userPromptFetchedData = await axios({
            method: "POST",
            url: `https://graph.facebook.com/v${CLOUD_API_VERSION}/${business_phone_number_id}/messages`,
            headers: {
              Authorization: `Bearer ${GRAPH_API_TOKEN}`,
            },
            data: {
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: message.from ?? "Whatsapp User",
              type: "interactive",
              interactive: {
                type: "button",
                body: {
                  text: initialAIMessage,
                },
                footer: {
                  text: "Powered by ChatGPT-3.5",
                },
                action: {
                  buttons: [
                    {
                      type: "reply",
                      reply: {
                        id: "STOP_CHAT_WITH_PAW",
                        title: "Berhenti ngobrol",
                      },
                    },
                  ],
                },
              },
            },
            context: {
              message_id: message.id,
            },
          });
        }
      } else if (buttonReplyId === "STOP_CHAT_WITH_PAW") {
        chatWithPAW = false;

        await axios({
          method: "POST",
          url: `https://graph.facebook.com/v${process.env.CLOUD_API_VERSION}/${business_phone_number_id}/messages`,
          headers: {
            Authorization: `Bearer ${process.env.GRAPH_API_TOKEN}`,
          },
          data: {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: message.from ?? "WhatsApp User",
            type: "text",
            text: {
              preview_url: false,
              body: "Semoga jawaban dari PAW dapat membantu yaa!",
            },
          },
          context: {
            message_id: message.id,
          },
        });
      }
    }

    // else if (message?.type === "interactive" && chatWithPAW === true) {
    // }

    console.log("Current chatWithPAW is", chatWithPAW);
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
