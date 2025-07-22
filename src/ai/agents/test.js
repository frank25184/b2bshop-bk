require('dotenv').config();
const { PraisonAIAgents, Agent } = require('praisonai');
const anthropic = require('@anthropic-ai/sdk');

const anthropicClient = new anthropic.Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const llm_config = {
  client: {
    beta: {
      chat: {
        completions: {
          create: anthropicClient.beta.messages.create
        }
      }
    }
  },
  model: "claude-3-sonnet-20240320",
  temperature: 0.7,
  max_tokens: 1000,
  stream: false
};

// Create a story agent and a summary agent
const storyAgent = new Agent({
  instructions: "You are a creative storyteller. Create engaging stories.",
  name: "Storyteller",
  llm:llm_config
});

const summaryAgent = new Agent({
  instructions: "You summarize stories into brief, engaging summaries.",
  name: "Summarizer",
  llm:llm_config
});

// Create multi-agent system
const agents = new PraisonAIAgents({
  agents: [storyAgent, summaryAgent],
  tasks: [
    "Create a short story about a magical forest",
    "Summarize the story in 2 sentences"
  ]
});

// Run the agents
agents.start()
  .then(responses => {
    console.log('\nStory:');
    console.log(responses[0]);
    console.log('\nSummary:');
    console.log(responses[1]);
  })
  .catch(error => console.error('Error:', error));




// const { Agent, Task } = require('praisonai');

// // Create a task-based agent
// const agent = new Agent({
//   name: "TaskMaster",
//   role: "Assistant",
//   goal: "Complete tasks efficiently",
//   backstory: "You are an AI assistant that helps complete tasks step by step."
// });

// // Create a task with dependencies
// const mainTask = new Task({
//   name: "Write Blog Post",
//   description: "Write a blog post about artificial intelligence",
//   expected_output: "A complete blog post",
//   dependencies: []
// });

// // Execute the task
// agent.execute(mainTask)
//   .then(response => {
//     console.log('\nBlog Post:');
//     console.log(response);
//   })
//   .catch(error => console.error('Error:', error));
