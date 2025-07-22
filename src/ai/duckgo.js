const express = require('express');
const fetch = require('node-fetch');
const { Readable } = require('stream');

const STATUS_URL = "https://duckduckgo.com/duckchat/v1/status";
const CHAT_URL = "https://duckduckgo.com/duckchat/v1/chat";
const STATUS_HEADERS = { "x-vqd-accept": "1" };

const _model = {
  "gpt-4o-mini": "gpt-4o-mini",
  "claude-3-haiku": "claude-3-haiku-20240307",
  "llama": "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
  "mixtral": "mistralai/Mixtral-8x7B-Instruct-v0.1",
};

class Chat {
  constructor(vqd, model) {
    this.oldVqd = vqd;
    this.newVqd = vqd;
    this.model = model;
    this.messages = [];
  }

  async fetch(content) {
    this.messages.push({ content, role: "user" });
    const payload = {
      model: this.model,
      messages: this.messages,
    };
    const message = await fetch(CHAT_URL, {
      headers: { "x-vqd-4": this.newVqd, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!message.ok) {
      throw new Error(`${message.status}: Failed to send message. ${message.statusText}`);
    } else {
      return message;
    }
  }

  async fetchFull(content) {
    const message = await this.fetch(content);
    let text = "";
    const stream = Readable.from(message.body);

    for await (const chunk of stream) {
      const messageData = JSON.parse(chunk.toString());
      if (messageData["message"] === undefined) {
        break;
      } else {
        text += messageData["message"];
      }
    }

    const newVqd = message.headers.get("x-vqd-4");
    this.oldVqd = this.newVqd;
    this.newVqd = newVqd;

    this.messages.push({ content: text, role: "assistant" });

    return text;
  }

  async *fetchStream(content) {
    const message = await this.fetch(content);
    const stream = Readable.from(message.body);
    let text = "";

    for await (const chunk of stream) {
      const messageData = JSON.parse(chunk.toString());
      if (messageData["message"] === undefined) {
        break;
      } else {
        const data = messageData["message"];
        text += data;
        yield data;
      }
    }

    const newVqd = message.headers.get("x-vqd-4");
    this.oldVqd = newVqd;
    this.newVqd = newVqd;

    this.messages.push({ content: text, role: "assistant" });
  }

  redo() {
    this.newVqd = this.oldVqd;
    this.messages.pop();
    this.messages.pop();
  }
}

async function initChat(model) {
  const status = await fetch(STATUS_URL, { headers: STATUS_HEADERS });
  const vqd = status.headers.get("x-vqd-4");
  if (!vqd) {
    throw new Error(`${status.status}: Failed to initialize chat. ${status.statusText}`);
  }
  return new Chat(vqd, _model[model]);
}

// Express setup
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/initChat', async (req, res) => {
  const { model } = req.body;
  try {
    const chatInstance = await initChat(model);
    res.json({ message: 'Chat initialized', chatInstance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initialize, optional models are gpt-4o-mini, claude-3-haiku, llama, mixtral
const chat = await initChat("gpt-4o-mini");

// Fetch the full reply in one go
let message = await chat.fetchFull("Hello");
console.log(message)

// Redo
chat.redo()
message = await chat.fetchFull("Hello");
console.log(message)

// Fetch the streamed reply
const stream = chat.fetchStream("Hello");
for await (let data of stream) {
  console.log(data)
}