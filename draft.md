# ai

This tutorial is about running DeepSeek-R1 locally (TODO: check what is listed in goals and what finally made it in the prototype)

For simplicity we will use [PostgreSQL](https://www.postgresql.org/) as it is easy to install it locally no matter what operating system you are using, we will also use the [pgvector extension](https://github.com/pgvector/pgvector), which is a "vector similarity search" extension for Postgres. Another advantage is that we will only need one database, to store and retrieve both, the users chat history and the vector embeddings that we will create (using our data) 

In this tutorial we will come along a lot of situations where we have more than one option, in those cases I will chose one that I will explain in detail but I will also add sources for the remaining options in case you want explore one of them further

This prototype uses technologies that can later be reused in production, locally we will open source versions, meaning we have no usage costs as long as we do prototyping locally, but those technologies have also commercial offers, meaning that when we decide to go into production we know that we will be able to chose between multiple offerings

## goals

* DeepSeek-R1 running locally (github repo has no actual code <https://github.com/deepseek-ai/DeepSeek-R1>, so using a version that is hosted on [huggingface "DeepSeek-R1-Distill-Qwen-1.5B"](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B), probably using [ollama](https://ollama.com/) to download, install and eventually query it locally
* chat which user server actions (server functions, TODO: verify, are server actions now really called server functions?)
* chat server actions in next.js 15 need get streamed, need to verify the response is streamed using the chrome network tab! 
* to query ollama we could use the [Ollama JavaScript Library](https://www.npmjs.com/package/ollama) or use the [Ollama Provider for the Vercel AI SDK](https://www.npmjs.com/package/ollama-ai-provider) (github repository: <https://github.com/sgomez/ollama-ai-provider>, docs: <https://sdk.vercel.ai/docs/introduction>) to connect to a local ollama using the [ai sdk](https://www.npmjs.com/package/ai)
* the ui does not need to be beautiful but we could use a styling library, shadcn, tailwind, ...? Or maybe ask v0 to create a UI for us
* is the response from the ui formatted using markdown? that would be great, but would it mean we need to use [react-markdown](https://github.com/remarkjs/react-markdown) or create a "markdown to HTML" pipeline (server side / in the server action code streaming back the async ai response) using [remark-rehype](https://github.com/remarkjs/remark-rehype) ourself and send back html instead of markdown
* an example of using langchain, to train? (not sure training is the right word, not sure if this is considered being RAG) so that the AI can reason using content from our own documents / code
* try out [github models](https://github.com/marketplace/models) for quick Prototyping using different models, I think they have the advantage that you only need a single API key and can then switch between all models (available in the [github models marketplace](https://github.com/marketplace?type=models)) to compare the result of your prompt, github models is free until until you hit their [rate limits](https://docs.github.com/en/github-models/prototyping-with-ai-models#rate-limits), they also have a [playground](https://docs.github.com/en/github-models/prototyping-with-ai-models) that lets you quickly (no coding required) compare a prompt using different models
* local (windows) installation of postgres extension pgvector <https://dev.to/mehmetakar/install-pgvector-on-windows-6gl>

## brainstorming and open questions

* is RAG the best training method, what about distilling our own version, after all the deepseek model weights are licensed under the MIT License

## reading list

Langflow seems to be an interesting tool to build AI agents and RAG pipelines (there is an open source and a commercial version):
<https://docs.langflow.org/>

next.js server actions configuration:
<https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions>

server actions best practices:
<https://medium.com/%40lior_amsalem/nextjs-15-actions-best-practice-bf5cc023301e>

langchain RAG (Python version):
part 1: <https://python.langchain.com/docs/tutorials/rag/>
part 2: <https://python.langchain.com/docs/tutorials/qa_chat_history/>

RAG pipeline using Ollama, Streamlit, LangChain, DeepSeek-R1, ChromaDB:
<https://blog.gopenai.com/how-to-build-a-privacy-first-rag-using-deepseek-r1-langchain-and-ollama-c5133a8514dd>

RAG pipeline using Ollama, Streamlit, LangChain, DeepSeek-R1, [Faiss](https://github.com/facebookresearch/faiss) (vector search)):
<https://medium.com/@pankaj_pandey/ae9077eb6f12>

good comparison of vector databases (for embeddings):
<https://www.datacamp.com/blog/the-top-5-vector-databases>

## notes from the deepseek docs

* Avoid adding a system prompt; all instructions should be contained within the user prompt
* For mathematical problems, it is advisable to include a directive in your prompt such as: "Please reason step by step, and put your final answer within \boxed{}.

## js tools (on npmjs)

* [Ollama JavaScript Library](https://www.npmjs.com/package/ollama)
* [@langchain/ollama](https://www.npmjs.com/package/@langchain/ollama)

## glossary

artificial intelligence AI: 
artificial intelligence AI: 
Generative artificial intelligence (Gen AI): <https://en.wikipedia.org/wiki/Generative_artificial_intelligence>
Retrieval Augmented Generation (RAG): is a technique used to add your own data to the reasoning process of an AI model
ai model: 
ai agent: 
open weight: 