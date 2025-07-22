
// let dotenv = require("dotenv");
// dotenv.config();
const { Configuration, OpenAIApi } = require("openai");
let env = process.env.NODE_ENV || 'development';
let config = require(`../../config.${env}.js`);
// if (!process.env.CHATGPT_API_KEYS) {
//   console.error('Error: CHATGPT_API_KEYS is undefined in .env file');
//   process.exit(1);
// }

const CHATGPT_API_KEYS = config.CHATGPT_API_KEYS; // Parse passwords from env variable
const randomIndex = Math.floor(Math.random() * CHATGPT_API_KEYS.length); // Generate random index
const randomKey = CHATGPT_API_KEYS[randomIndex]; // Get random password from array

//console.log(`key: ${randomKey}`)
async function rewriteOne(user_input,isTLDR=false)  {
    const configuration = new Configuration({
      apiKey: randomKey 
    });  
    const openai = new OpenAIApi(configuration);
  
    const history = [];
  
    const rewrittenData = [];
    let prompt;
    if(isTLDR){
      prompt = 'TLDR with high source compression, removing stop words,summaring the paragraph shortest possible and limit your reply to 10 words whilst retaining the original meaning and context.Only give me the rewritten passage and do not give any explanation. Your sentence must be authentic,meaningful and grammatically correct. The passage is: ' + user_input;
    }else{
      prompt = `Help me rewrite what I give you.First,produce similar number of words,meaningful and grammatically correct. Secondly, reorder most of the words and phrases from the passage I give you.Thirdly, choose one or two html tags(p,ul/li) for each sentence. Remove empty 'p' tags. Lastly, rewrite using as simple expressions as possible. Reply only the rewritten passage. The sentenses are:${user_input}`;
    }
    // const prompt = `Help me rewrite it.Requirements:
    // 1, Give me the similar number of words and output only one sentense. 
    // 2, Reorder all the content and rewrite most of the words and phrases from the original passage with the language of everyday life.
    // 3, The sentence should be as concise and explicit as possible with no complicated words and don't use words or phrases that have been used two times.
    // 4,Output only the rewritten passage with no newline escape sequence.The sentenses are:${user_input}`;



    //   const messages = [];
    //   for (const [input_text, completion_text] of history) {
    //     messages.push({ role: "user", content: input_text });
    //     messages.push({ role: "assistant", content: completion_text });
    //   }
  
    //   messages.push({ role: "user", content: user_input });
  
      try {
        const completion = await openai.createCompletion({
          model: "text-davinci-003",
          prompt,
          max_tokens: 2000,
          temperature:0.75

        });
        console.log(`completion.data.choices[0]: ${JSON.stringify(completion.data.choices[0])}`)
  
        const completion_text = completion.data.choices[0].text;
        console.log(`completion_text: `+ completion_text);
  
       // history.push([user_input, completion_text]);

        return completion_text;
  
      } catch (error) {
        
        if (error.response) {
          console.error(error.response.status);
          console.error(error.response.data);
          

          return;

        } else {
            console.error(error.message);
            return;
        }
      }




  };


  module.exports = rewriteOne;




































// // Configure the OpenAI API client
// const openai = new OpenAI(process.env.CHATGPT_API_KEY);

// // Define a function to rewrite the data using the OpenAI API
// async function rewriteData(originalData) {
//   const rewrittenData = [];
//   const prompt = `Please rewrite the following sentences to make them more easily understandable to a general audience. Please aim for readability and clarity while maintaining the original meaning and the number of the sentence(equal to or greater than that of the original words).Also maintain the html tags.

// ${originalData.map(data => data.text).join('\n\n')}`;
//   const response = await openai.complete({
//     engine: 'text-davinci-002',
//     prompt,
//     maxTokens: 100,
//     n: 1,
//     temperature: 0.5,
//   });
//   const choices = response.data.choices;
//   for (let i = 0; i < originalData.length; i++) {
//     const rewrittenText = choices[i].text;
//     rewrittenData.push({ text: rewrittenText });
//   }
//   return rewrittenData;
// }

// // Define a function to save the rewritten data to MongoDB
// async function saveRewrittenData(rewrittenData) {
//   for (let i = 0; i < rewrittenData.length; i++) {
//     const originalDocument = await Original.findOne({ text: originalData[i].text });
//     if (originalDocument) {
//       originalDocument.rewrittenText = rewrittenData[i].text;
//       await originalDocument.save();
//     } else {
//       const newDocument = new Original({ text: originalData[i].text, rewrittenText: rewrittenData[i].text });
//       await newDocument.save();
//     }
//   }
// }

// // Retrieve the data to be rewritten from MongoDB
// Original.find({}, function (err, originalData) {
//   if (err) {
//     console.log(err);
//     mongoose.connection.close();
//   } else {
//     // Rewrite the data
//     rewriteData(originalData)
//       .then((rewrittenData) => {
//         // Save the rewritten data to MongoDB
//         saveRewrittenData(rewrittenData)
//           .then(() => {
//             console.log('Data successfully rewritten and saved to MongoDB.');
//             mongoose.connection.close();
//           })
//           .catch((err) => {
//             console.log(err);
//             mongoose.connection.close();
//           });
//       })
//       .catch((err) => {
//         console.log(err);
//         mongoose.connection.close();
//       });
//   }
// });