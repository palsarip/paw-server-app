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

const chatWithAi = async (message) =>  {
  try{
    
    ""
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
            content: message,
          },
        ],
        temperature: 0.7,
      },
    });
    
    return initialFetchedAIData;
  }catch(error){
    console.log("error dari function chatWithAi: ", error.message);
  }
  
}

const welcome = async (message, business_phone_number_id, yangMauDikirim) => {
  try {
    console.log(message, ' ', business_phone_number_id);

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
            text: yangMauDikirim
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
    console.log("error dari welcome function: ",error.message);
  }
};

// const chatWithPAW = async () => {
//   let initialAIMessage = "";

//   const initialFetchedAIData = axios({
//     method: "POST",
//     url: `https://api.openai.com/v1/chat/completions`,
//     headers: {
//       Authorization: `Bearer ${OPENAI_API_KEY}`,
//     },
//     data: {
//       model: "gpt-3.5-turbo",
//       messages: [
//         {
//           role: "user",
//           content: "Halo, aku mau ngobrol sama kamu!",
//         },
//       ],
//       temperature: 0.7,
//     },
//   });

//   console.log(
//     "Initial AI Reply: ",
//     initialFetchedAIData.data.choices[0].message.content
//   );
//   initialAIMessage = initialFetchedAIData.data.choices[0].message.content;

//   await axios({
//     method: "POST",
//     url: `https://graph.facebook.com/v${CLOUD_API_VERSION}/${business_phone_number_id}/messages`,
//     headers: {
//       Authorization: `Bearer ${GRAPH_API_TOKEN}`,
//     },
//     data: {
//       messaging_product: "whatsapp",
//       recipient_type: "individual",
//       to: message.from ?? "Whatsapp User",
//       type: "interactive",
//       interactive: {
//         type: "button",
//         body: {
//           text: initialAIMessage,
//         },
//         footer: {
//           text: "Powered by ChatGPT-3.5",
//         },
//         action: {
//           buttons: [
//             {
//               type: "reply",
//               reply: {
//                 id: "STOP_CHAT_WITH_PAW",
//                 title: "Berhenti ngobrol",
//               },
//             },
//           ],
//         },
//       },
//     },
//     context: {
//       message_id: message.id,
//     },
//   });

//   while (chatWithPAW === true) {
//     let userPromptMessage = [];
//     let AIReplyMessage = "";

//     const userMessages = req.body.entry?.[0]?.changes[0]?.value?.messages || [];
//     userMessages.forEach((msg) => {
//       if (msg.text) {
//         userPromptMessage.push(msg.text);
//       }
//     });

//     const AIReplyFetchedData = await axios({
//       method: "POST",
//       url: `https://api.openai.com/v1/chat/completions`,
//       headers: {
//         Authorization: `Bearer ${OPENAI_API_KEY}`,
//       },
//       data: {
//         model: "gpt-3.5-turbo",
//         messages: userPromptMessage.map((msg) => ({
//           role: "user",
//           content: msg,
//         })),
//         temperature: 0.7,
//       },
//     });

//     console.log(
//       "User Prompt:",
//       req.body.entry?.[0]?.changes[0]?.value?.messages?.[0]
//     );
//     console.log(
//       "AI Reply:",
//       AIReplyFetchedData.data.choices[0].message.content
//     );

//     AIReplyMessage = AIReplyFetchedData.data.choices[0].message.content;

//     const userPromptFetchedData = await axios({
//       method: "POST",
//       url: `https://graph.facebook.com/v${CLOUD_API_VERSION}/${business_phone_number_id}/messages`,
//       headers: {
//         Authorization: `Bearer ${GRAPH_API_TOKEN}`,
//       },
//       data: {
//         messaging_product: "whatsapp",
//         recipient_type: "individual",
//         to: message.from ?? "Whatsapp User",
//         type: "interactive",
//         interactive: {
//           type: "button",
//           body: {
//             text: AIReplyMessage,
//           },
//           footer: {
//             text: "Powered by ChatGPT-3.5",
//           },
//           action: {
//             buttons: [
//               {
//                 type: "reply",
//                 reply: {
//                   id: "STOP_CHAT_WITH_PAW",
//                   title: "Berhenti ngobrol",
//                 },
//               },
//             ],
//           },
//         },
//       },
//       context: {
//         message_id: message.id,
//       },
//     });
//   }
// };

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
      welcome(message,business_phone_number_id,"welcome jink");
    } else {
      if (userData.chatWithPAW) {
        const AIrespond = chatWithAi(message?.text.body);
        console.log("respon ai: ", AIrespond);
        welcome(message,business_phone_number_id,"ini respon:");
        welcome(message,business_phone_number_id,AIrespond);
      }

      if (message?.text.body === "1") {
        
        userData.chatWithPAW = true;
        welcome(message,business_phone_number_id,"kamu akan chat dengan PAW, ad yang bisa dibantu?");
      }
      welcome(message,business_phone_number_id,"apa si, klo mw chat ama gw, teken 1");
      
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
