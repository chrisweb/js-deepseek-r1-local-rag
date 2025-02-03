# ai

## goals

* deepseek running locally (github repo has no actual code <https://github.com/deepseek-ai/DeepSeek-R1>, so using version hosted on [huggingface "DeepSeek-R1-Distill-Qwen-1.5B"](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B), probably using [ollama](https://ollama.com/) to download it locally
* chat which user server actions (server functions, TODO: verify, are server actions now really called server functions?)
* chat server actions in next.js 15 need get streamed, need to verify the response is streamed using the chrome network tab! 
* to query ollama we could use the [Ollama JavaScript Library](https://www.npmjs.com/package/ollama) or use the [Ollama Provider for the Vercel AI SDK](https://www.npmjs.com/package/ollama-ai-provider) (github repository: <https://github.com/sgomez/ollama-ai-provider>, docs: <https://sdk.vercel.ai/docs/introduction>) to connect to a local ollama using the [ai sdk](https://www.npmjs.com/package/ai)
* the ui does not need to be beautiful but we could use a styling library, shadcn, tailwind, ...? Or maybe ask v0 to create a UI for us
* is the response from the ui formatted using markdown? that would be great, but would it mean we need to use [react-markdown](https://github.com/remarkjs/react-markdown) or create a "markdown to HTML" pipeline (server side / in the server action code streaming back the async ai response) using [remark-rehype](https://github.com/remarkjs/remark-rehype) ourself and send back html instead of markdown
* an example of using langchain, to train? (not sure training is the right word, not sure if this is considered being RAG) so that the AI can reason using content from our own documents / code

## reading list

next.js server actions configuration:
https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions

server actions best practices:
<https://medium.com/%40lior_amsalem/nextjs-15-actions-best-practice-bf5cc023301e>

## js tools (on npmjs)

* [Ollama JavaScript Library](https://www.npmjs.com/package/ollama)
* [@langchain/ollama](https://www.npmjs.com/package/@langchain/ollama)
