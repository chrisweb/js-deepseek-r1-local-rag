# Next.js 15 AI onboarding tool

## Run DeepSeek-R1 locally using Ollama

in this chapter we will start by installing ollama and then we will pull the deepseek model using ollama and run some prompt tests

### Ollama installation

#### Windows

To install Ollama on Windows [download the Ollama setup exe](https://ollama.com/download/windows) from the ollama website, once it has finished downloading click on the download in your browser or open the download folder and double click on the file to start the Ollama installation

After the installation has finished Ollama will get added to your PATH, you might want to restart your terminal to make sure it is aware of the new PATH

#### Linux

To install Ollama on Linux you can use the following command:

```shell
curl -fsSL https://ollama.com/install.sh | sh
```

Or check out the ["manual installation" on Linux](https://github.com/ollama/ollama/blob/main/docs/linux.md) documentation in the Ollama repository

#### macOS

To install Ollama on macOS I recommend using brew: <https://formulae.brew.sh/formula/ollama>, or if you prefer you can download a [zip file for macOS](https://ollama.com/download/mac) from the ollama website

### Ollama quickstart

we will start with the smallest [deepseek-r1](https://ollama.com/library/deepseek-r1) model that is available, we will then make a first test to see how well it performs on our hardware, if it is fast then we can still switch to more computational power hungry versions

ollama has the following estimate when it comes to resources that need to be available on your local machine:

> You should have at least 8 GB of RAM available to run the 7B models, 16 GB to run the 13B models, and 32 GB to run the 33B models.

in your terminal use the following command to pull the DeepSeek-R1-Distill-Qwen-1.5B model using ollama:

```shell
ollama run deepseek-r1:1.5b
```

After the installation has finished Ollama will offer you to enter your first message, try out something like:

> Please identify yourself

DeepSeek-R1 will do some thinking and then reply with a short answer, mine was like this:

> Hi! I'm DeepSeek-R1, an AI assistant created by DeepSeek. I'm here to help answer questions, provide information, and assist with various tasks. Thank you for asking! How can I assist you today?

Great we have verified that DeepSeek-R1 is running locally and can answer our questions

### Ollama commands

Ollama can be used for more than just relaying questions to the model, an easy way to find out more about those commands is to type `/?` as message to Ollama, after you press `Enter` you will get a list of useful Ollama commands

> [!TIP]  
> To exit the conversation (the ollama shell) press `Ctrl+D` (macOS: `⌘D`, Linux: `Ctrl+D`)  

To list the models that are currently installed locally use this command:

```shell
ollama list
```

to stop a model use:

```shell
ollama stop
```

to see what version of ollama is currently installed use:

```shell
ollama -v
```

> [!MORE]  
> [Ollama Readme](https://github.com/ollama/ollama)  

## AI Retrieval-Augmented Generation (RAG)

We will use a technique called **Retrieval-Augmented Generation (RAG)** to provide our Large Language Model (LLM) with external information. For the LLM to be able to use our information we will:

* first need to get the content from our local documents (markdown files)
* then we will split those documents into smaller chunks (that are easier for the LLM to digest 😉)
* then we will use an embeddings model to create vectors
* and finally we will store those vectors into a vector database 

### LangChain.js Installation

Python is usually the language of choice when data engineers create a project, but as a web developer I want to only use Javascript tools, so instead of using the python version of the [Langchain Framework](https://github.com/langchain-ai/langchain) we will use the [LangChain.js](https://github.com/langchain-ai/langchainjs) version that is written in Javascript (Typescript)

```shell
npm i langchain --save-exact
```

> [!MORE]  
> [LangChain.js API Reference](https://v03.api.js.langchain.com/index.html)  

### Data loader to get the content of markdown documents

The first thing we will develop is a data loader:

```ts title="scripts/embeddings.ts"
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import path from 'node:path'
import { type Document } from 'langchain/document'

async function loadDocuments(documentsPath: string): Promise<Document[]> {

    const loader = new DirectoryLoader(
        path.join(process.cwd(), documentsPath),
        {
            '.md': filePath => new TextLoader(filePath),
        }
    )

    const docs = await loader.load()

    return docs

}

async function main() {
    try {
        const documentsPath = 'docs'
        const documents = await loadDocuments(documentsPath)
        console.log('documents loaded: ', documents.length)
    } catch (error) {
        console.error('Error processing documents:', error)
    }
}

await main()
```

We use the langchain **DirectoryLoader** to scan a directory for documents and then load each document using the langchain **TextLoader**

TODO: <https://github.com/langchain-ai/langchainjs/blob/main/libs/langchain-community/src/document_loaders/fs/obsidian.ts>


### Split documents into chunks

```ts title="scripts/embeddings.ts"
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { MarkdownTextSplitter } from 'langchain/text_splitter'
import path from 'node:path'
import { type Document } from 'langchain/document'

async function loadDocuments(documentsPath: string): Promise<Document[]> {

    const loader = new DirectoryLoader(
        path.join(process.cwd(), documentsPath),
        {
            '.md': filePath => new TextLoader(filePath),
        }
    )

    const docs = await loader.load()

    return docs

}

async function splitIntoChunks(docs: Document[]): Promise<Document[]> {

    const markdownSplitter = new MarkdownTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    })

    const chunks = await markdownSplitter.splitDocuments(docs)

    return chunks
}

async function main() {
    try {
        const documentsPath = 'docs'
        const documents = await loadDocuments(documentsPath)
        console.log('documents loaded: ', documents.length)
        const chunks = await splitIntoChunks(documents)
        console.log('chunks created: ', chunks.length)
    } catch (error) {
        console.error('Error processing documents:', error)
    }
}

await main()
```

TODO: might want to use a regex for markdown headings to split by chapters???

### Pull an Embeddings Model

First we need to install @langchain/ollama:

```shell
npm i @langchain/ollama --save-exact
```

Next we need to pull an embeddings model, in this tutorial we will use the latest [nomic-embed-text model](), by using the following command in our terminal:

```shell
ollama pull nomic-embed-text:latest
```

Now we can create a new function that will use @langchain/ollama to create embeddings for each of our chunks:

```ts title="scripts/embeddings.ts"
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { MarkdownTextSplitter } from 'langchain/text_splitter'
import path from 'node:path'
import { type Document } from 'langchain/document'

async function loadDocuments(documentsPath: string): Promise<Document[]> {

    const loader = new DirectoryLoader(
        path.join(process.cwd(), documentsPath),
        {
            '.md': filePath => new TextLoader(filePath),
        }
    )

    const docs = await loader.load()

    return docs

}

async function splitIntoChunks(docs: Document[]): Promise<Document[]> {

    const markdownSplitter = new MarkdownTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    })

    const chunks = await markdownSplitter.splitDocuments(docs)

    return chunks
}

async function processChunks(chunks: Document[]) {
    const options: OllamaEmbeddingsParams = {
        // https://ollama.com/library/nomic-embed-text
        model: 'nomic-embed-text:latest',
        baseUrl: 'http://localhost:11434',
    }
    const embeddings = new OllamaEmbeddings(options)
    const vectors = await embeddings.embedDocuments(chunks.map(chunk => chunk.pageContent))
    return vectors
}

async function main() {
    try {
        const documentsPath = 'docs'
        const documents = await loadDocuments(documentsPath)
        console.log('documents loaded: ', documents.length)
        const chunks = await splitIntoChunks(documents)
        console.log('chunks created: ', chunks.length)
        const vectors = await processChunks(chunks)
        console.log('vectors created: ', vectors[0].length)
    } catch (error) {
        console.error('Error processing documents:', error)
    }
}

await main()
```

### Install PostgreSQL

Windows: download the [PostgreSQL Windows installer](https://www.postgresql.org/download/windows/)

macOS: using the [brew command](https://www.postgresql.org/download/macosx/):

```shell
brew install postgresql@17
```

Linux: several [PostgreSQL Linux distributions](https://www.postgresql.org/download/) are supported:

For example on Ubuntu/Debian you can use:

```shell
apt install postgresql
```

> [!TIP]  
> Windows: PostgreSQL will run as a service in the background, you can stop / pause / restart the service by using the Windows **Services** tool (click on Windows start and type "Services" to find it)

#### pgvector for PostgreSQL

Next we need to install **pgvector** (or if you prefer you can use the [pgvector docker](https://hub.docker.com/r/pgvector/pgvector))

I have added instructions below for Windows, if you use macOS or Linux I recommend you follow the installation instructions from the [pgvector readme](https://github.com/pgvector/pgvector)

##### Installation

On Windows:

First we need to make sure the we have the C++ build tools for Visual Studio installed, if you have the build tools of even the full version of Visual Studio installed then you can skip this step, else either install the Visual Studio IDE (which includes the build tools) or you can install the [Build Tools for Visual Studio](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022) as standalone

When it has finished downloading, double click on the **Visual Studio Installer** to launch it

Next in the Installed tab you should either have the Visual Studio or the standalone build tools being listed, click on **Modify** and then locate the **Desktop development with C++** and check the checkbox in the top right corner

Now you will see the details of what is about to get installed on the left

![]()

Finally click on **Install** button (in the bottom left, next to the close button) to apply the changes and install the C++ development tools

To make sure everything we need got installed, make sure the following file exists:

```shell
C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat
```

> [!NOTE]  
> Depending on what version you installed you might have to adjust the path, for example I download version 2022, also as I downloaded the Visual Studio Build tools we have "BuildTools", if you downloaded the Visual Studio community edition then you should have "Community" in your path.

Next step is to open the **Command Prompt** for VS 2022 (or the default one will work too) as **administrator** (right click the name, and then "Run as administrator"), you can find it clicking on start (bottom left windows icon) and then type "cmd"

Now that the VS command prompt is open we type the following commands, line by line, just make sure you adjust the versions of the tools:

* line 2: we clone the pgvector repository (here we install version 0.8.0 which as of Jan. 2025 is the latest, you may want to check out the [pgvector tags on GitHub](https://github.com/pgvector/pgvector/tags) to make sure this is still the latest version)
* line 4: we setup the visual studio environment by running a bat file, adjust the **path** based on what Visual Studio edition or tools are have installed, see the Note above
* line 5: we set the path to PostgreSQL, make sure to adjust the version to match the one that is installed on your device

```shell
cd %TEMP%
git clone https://github.com/pgvector/pgvector.git --branch v0.8.0
cd pgvector
"C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
set "PGROOT=C:\Program Files\PostgreSQL\17"
nmake /F Makefile.win
nmake /F Makefile.win install
```

##### Getting started

Next we need to run some queries, by using the pgAdmin query tool. If you haven't installed it yet or want to update it visit the: [pgAdmin 4 downloads](https://www.pgadmin.org/download/) page

> [!TIP]  
> When migrating to a new version of pgAdmin on Windows, you might get this Error:
>  
> > PermissionError: [WinError 32] The process cannot access the file because it is being used by another process
>  
> In which case the solution is to delete everything in the `%APPDATA%\pgAdmin` to reset pgAdmin and then start pgAdmin

Open pgAdmin and connect to your local server

First we create a **new database** (right click Databases and choose Create), in this tutorial we will name it **vector_store**

Next we right click on the database name and select **Query Tool**

Our first query will **enable pgvector** for the current database (copy the following query into your Query Tool and click the Execute (play) button to run the query):

```shell
CREATE EXTENSION vector;
```

#### Storing the vectors

Back to coding soon, but first we need to install the [@langchain/community](https://github.com/langchain-ai/langchainjs/tree/main/libs/langchain-community/) and also the [pg (node-postgres)](https://www.npmjs.com/package/pg) package:

```shell
npm i @langchain/community pg --save-exact
```

And then the types for pg:

```shell
npm i @types/pg --save-exact --save-dev
```

Next we add a function to use the langchain pgvector vectorstore:

```ts title="scripts/embeddings.ts"
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { MarkdownTextSplitter } from 'langchain/text_splitter'
import path from 'node:path'
import { type Document } from 'langchain/document'
import { OllamaEmbeddings, type OllamaEmbeddingsParams } from '@langchain/ollama'
import { PGVectorStore, type PGVectorStoreArgs } from '@langchain/community/vectorstores/pgvector'
import pg, { type PoolConfig, type Pool as PoolType } from 'pg'

const { Pool } = pg

async function loadDocuments(documentsPath: string) {

    const loader = new DirectoryLoader(
        path.join(process.cwd(), documentsPath),
        {
            '.md': filePath => new TextLoader(filePath),
        }
    )

    const docs = await loader.load()

    return docs

}

async function splitIntoChunks(docs: Document[]) {

    const markdownSplitter = new MarkdownTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    })

    const chunks = await markdownSplitter.splitDocuments(docs)

    return chunks
}

async function processChunks(chunks: Document[]) {
    const embeddings = getEmbeddings()
    const vectors = await embeddings.embedDocuments(chunks.map(chunk => chunk.pageContent))
    return vectors
}

async function storeVectors(vectors: number[][], chunks: Document[], pgPool: PoolType) {
    const embeddings = getEmbeddings()
    const options: PGVectorStoreArgs = {
        pool: pgPool,
        tableName: 'vectors',
        columns: {
            idColumnName: 'id',
            vectorColumnName: 'vector',
            contentColumnName: 'content',
            metadataColumnName: 'metadata',
        },
        // supported distance strategies: cosine (default), innerProduct, or euclidean
        distanceStrategy: 'cosine',
    }
    const vectorStore = await PGVectorStore.initialize(embeddings, options)
    await vectorStore.addVectors(vectors, chunks)
    return vectorStore
}

// async function that creates a pg pool
function createPool() {

    const postgresOptions: PoolConfig = {
        host: '127.0.0.1',
        port: 5432,
        user: 'postgres',
        password: '123',
        database: 'vector_store',
    }

    const pool = new Pool(postgresOptions)

    pool.on('error', (error) => {
        console.error('Unexpected error on idle client', error)
        process.exit(-1)
    })

    return pool
}

async function endPool(vectorStore: PGVectorStore) {
    await vectorStore.end()
}

function getEmbeddings() {
    const options: OllamaEmbeddingsParams = {
        // https://ollama.com/library/nomic-embed-text
        model: 'nomic-embed-text:latest',
        baseUrl: 'http://localhost:11434',
    }
    const embeddings = new OllamaEmbeddings(options)
    return embeddings
}

async function main() {
    try {
        const documentsPath = 'docs'
        const documents = await loadDocuments(documentsPath)
        console.log('documents loaded: ', documents.length)
        const chunks = await splitIntoChunks(documents)
        console.log('chunks created: ', chunks.length)
        const vectors = await processChunks(chunks)
        console.log('vectors created: ', vectors[0].length)
        const pgPool = createPool()
        const vectorStore = await storeVectors(vectors, chunks, pgPool)
        console.log('vectors stored')
        await endPool(vectorStore)
        console.log('postgres pool released')
    } catch (error) {
        console.error('Error processing documents:', error)
    }
}

await main()
```

> [!MORE]  
> [PGVectorStore API reference](https://v03.api.js.langchain.com/classes/_langchain_community.vectorstores_pgvector.PGVectorStore.html)  

## AI Frontend using Next.js 15 and React 19

In this chapter we will install Next.js 15 and React 19 and then create an UI that can be used to interact with the AI model, by letting us send prompts and then display the response

### Next.js 15 installation using create-next-app (CNA)

To install Next.js 15 and React 19 we are going to use [create-next-app (CNA)](https://www.npmjs.com/package/create-next-app)

First go into your projects folder:

cd MY_PROJECTS_PATH

To install the latest Next.js canary version use the following command:

```shell
npx create-next-app@canary
```

When you get asked if you agree to install the latest CNA canary, press **y** to accept

Then enter a **name** for your project, the name will get used to create a folder in your projects folder (to create a project in the current folder type `.\` as name, but make sure the folder is empty)

I suggest you answer the few questions like this (or customize the answers to your liking):

```shell
Would you like to use TypeScript? **Yes**
Would you like to use ESLint? **Yes**
Would you like to use Tailwind CSS? **No**
Would you like your code inside a `src/` directory? **No**
Would you like to use App Router? (recommended) **Yes**
Would you like to use Turbopack for `next dev`? **Yes**
Would you like to customize the import alias (`@/*` by default)? **Yes**
What import alias would you like configured? **@/\***
```

> [!MORE]  
> ["create-next-app (CNA)" documentation](https://nextjs.org/docs/app/api-reference/cli/create-next-app)  

### Improved linting

Install the following packages

```shell
npm i typescript-eslint @stylistic/eslint-plugin jiti --save-exact --save-dev
```

then change the content of your ESLint config file to this:

```ts

```

next rename the eslint.config.mjs file to eslint.config.ts

then I recommend using the automatic fixes, by using the following command in your terminal:

```shell
npx eslint --fix
```

then to run the linting process we can use this command:

```shell
npm run lint
```

### Cleanup

Next we do a little bit of cleanup, first we delete the files in /public and then we simplify the layout and homepage like this:

```tsx title="/app/layout.tsx"
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Create Next App',
    description: 'Generated by create next app',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    )
}
```

```tsx title="/app/page.tsx"
import styles from './page.module.css'

export default function Home() {
    return (
        <div className={styles.page}>
            
        </div>
    )
}
```

### Chat UI using MUI Material and Pigment CSS

We will use [MUI](https://mui.com/core/) **Material** for this project, but if you prefer [Tailwind 4](https://github.com/tailwindlabs/tailwindcss) (with [shadcn/ui](https://ui.shadcn.com/docs/cli)
(using their new CLI) or [daisyUI](https://github.com/saadeghi/daisyui)) would of course work too

> [!MORE]  
> [MUI "Material UI"](https://mui.com/material-ui/)  
> [Pigment CSS Readme](https://github.com/mui/pigment-css)  

#### Installation

For a default installation MUI recommends installing the following packages:

```shell
npm i @mui/material @mui/material-pigment-css --save-exact
```

and then also a **dev** dependencies:

```shell
npm i @pigment-css/nextjs-plugin --save-exact --save-dev
```

Pigment-css nextjs-plugin installation is likely going to fail:

```shell
npm error ERESOLVE unable to resolve dependency tree
```

In which case you can either add Next.js to your overrides in the package.json:

```json title="package.json"
    "overrides": {
        "next": "15.2.0-canary.39"
    }
```

Which is the solution I recommend as it will also prevent future installations to fail for the same reason

Or you could run the npm installation command for the "Pigment CSS Next.js plugin" using the [force flag](https://docs.npmjs.com/cli/v11/commands/npm-install) like so:

```shell
npm i @pigment-css/nextjs-plugin --save-exact --save-dev --force
```

For the icons we will use [lucide-react](https://lucide.dev/packages), so make sure that package is installed too:

```shell
npm i lucide-react --save-exact
```

TODO: do we need lucide? do we need the mui icons? do we install the material icons google font: https://fonts.google.com/icons?icon.set=Material+Icons (if we install the font we need to use [next font](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts))

#### MUI and Pigment CSS setup

First we need to edit our next.config.ts file to the **withPigment** function from the Pigment CSS Next.js plugin:

```tsx title="next.config.ts"
import type { NextConfig } from 'next'
import { withPigment, type PigmentOptions } from '@pigment-css/nextjs-plugin'
import { createTheme } from '@mui/material'

const nextConfig: NextConfig = {
    // Next.js configuration options
}

const pigmentConfig: PigmentOptions = {
    theme: createTheme({
        typography: {
            fontFamily: 'var(--font-roboto)',
        },
    }),
    transformLibraries: ['@mui/material'],
}

export default withPigment(nextConfig, pigmentConfig)
```

And we update our Layout to add the Roboto font (which is the font MUI uses by default) and we import the MUI material styles:

```tsx title="/app/layout.tsx"
import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'

import './globals.css'
import '@mui/material-pigment-css/styles.css'

export const metadata: Metadata = {
    title: 'Create Next App',
    description: 'Generated by create next app',
}

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-roboto',
})

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={roboto.variable}>
                {children}
            </body>
        </html>
    )
}
```

It is important that we import the **styles.css** file from the material-pigment-css package as this is file will hold all the CSS that Pigment CSS will generate for us. Next.js will take that CSS as well as the stylesheet from the global.css and transform them into optimized css files that it will add to the `<head>{:html}` element of our pages

// TODO: there is one thing that is quite confusing, examples like this one: <https://github.com/mui/material-ui/blob/v6.x/examples/material-ui-nextjs-ts/src/app/layout.tsx> or even documentation like this one: <https://mui.com/material-ui/integrations/nextjs/> seem to suggest I need an AppRouterCacheProvider as well as a ThemeProvider to make things work, but my usage of pigment seems to make these obsolete, I find my solution much simpler, so I will stick with my current pigment & mui setup unless I find out there is something wrong with it
// this documentation seems to much more modern: <https://mui.com/material-ui/migration/migrating-to-pigment-css/>
// i still need to understand how I can benefit from new features included in material design 3 / Material You? <https://github.com/mui/material-ui/issues/29345#issuecomment-2635842073>

> [!MORE]  
> [MUI "installation" documentation](https://mui.com/material-ui/getting-started/installation/)  
> ["MUI and Pigment CSS using Next.js" example](https://github.com/mui/material-ui/tree/master/examples/material-ui-pigment-css-nextjs-ts)  

#### Creating base components

> [!NOTE]  
> When I use a UI library like MUI, I like to create an abstraction layer by creating a **base** component for each MUI component that I will use. For example, by using a base component for the button, no matter how often we reuse our base button component, if in the future we want to replace MUI with another UI library, we only need to do it once in the base component.

Let's get started by creating a base button component:

```tsx title="/components/base/Button.tsx"
import Button, { type ButtonProps } from '@mui/material/Button'

export type BaseButtonProps = ButtonProps

const BaseButton: React.FC<BaseButtonProps> = (props) => {

    const { children, ...rest } = props

    return (
        <Button {...rest}>
            {children}
        </Button>
    )
}

export default BaseButton
```

We will also need an Input field base component:

```tsx title="/components/base/Input.tsx"
import Input, { type InputProps } from '@mui/material/Input'

export type BaseInputProps = InputProps

const BaseInput: React.FC<BaseInputProps> = (props) => {

    return (
        <Input {...props} />
    )
}

export default BaseInput
```

And finally our third base component will be for the form element:

```tsx title="/components/base/Form.tsx"
'use client'

import type React from 'react'
import FormControl from '@mui/material/FormControl'

export type BaseFormProps = React.PropsWithChildren<React.FormHTMLAttributes<HTMLFormElement>>

const BaseForm: React.FC<BaseFormProps> = (props) => {

    const { children, ...rest } = props

    return (
        <form {...rest}>
            <FormControl>
                {children}
            </FormControl>
        </form>
    )
}

export default BaseForm
```

Each component re-exports the React props, creating an abstraction layer that will allow us in the future to customize the **props type**, without needing to change something in the components that use the type

#### Creating a basic custom Chat UI

Now that we have created our 3 base components we can finally build a minimalistic UI for our chat interface:

```tsx title="/components/chat/MessageInput.tsx"
'use client'

import Form from '@/components/base/Form'
import Input from '@/components/base/Input'
import Button from '@/components/base/Button'

const MessageInput: React.FC = () => {


    const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {

        const formData = new FormData(event.currentTarget)

        event.preventDefault()

        // use the entries (names and values) or values (only values)
        formData.entries().forEach(([name, value], index) => {
            console.log('name, value, index: ', name, value, index)
        })

    }

    return (
        <Form onSubmit={onSubmitHandler}>
            <Input name="prompt" />
            <Button type="submit">s</Button>
        </Form>
    )
}

export default MessageInput
```

Next we update the code of the **page** to add our newly created **MessageInput** UI component:

```tsx title="/app/page.tsx"
import type React from 'react'
import styles from './page.module.css'
import MessageInput from '@/components/chat/MessageInput'

export default function Home() {

    return (
        <div className={styles.page}>
            <MessageInput />
        </div>
    )
}
```

#### React Action

Our next goal is to replace the conventional onSubmit handler by a React Action:

```tsx title="/components/chat/MessageInput.tsx"
'use client'

import Form from '@/components/base/Form'
import Input from '@/components/base/Input'
import Button from '@/components/base/Button'

const MessageInput: React.FC = () => {

    const submitAction = (formData: FormData) => {
        // use the entries (names and values) or values (only values)
        formData.entries().forEach(([name, value], index) => {
            console.log('name, value, index: ', name, value, index)
        })
    }

    return (
        <Form action={submitAction}>
            <Input name="prompt" />
            <Button type="submit">s</Button>
        </Form>
    )
}

export default MessageInput
```

If you compare the current code with the code from the previous **MessageInput** component then you will notice that by using the **action** we have simplified our code, we can push this further by putting the action itself into it's own file

First we create a new actions folder in the root of project, that folder will have a similar structure to what we do in the components folder `/actions/chat`

Next we create the Action file:

```tsx title="/actions/chat/Submit.ts"
const submitAction = (formData: FormData) => {
    // use the entries (names and values) or values (only values)
    formData.entries().forEach(([name, value], index) => {
        console.log('name, value, index: ', name, value, index)
    })
}

export default submitAction
```

And finally we import the new Action in our client component:

```tsx title="/components/chat/MessageInput.tsx"
'use client'

import Form from '@/components/base/Form'
import Input from '@/components/base/Input'
import Button from '@/components/base/Button'
import submitAction from '@/actions/chat/SubmitAction'

const MessageInput: React.FC = () => {
    return (
        <Form action={submitAction}>
            <Input name="prompt" />
            <Button type="submit">s</Button>
        </Form>
    )
}

export default MessageInput
```

For now this is a client Action and so the console log can be seen in our browser dev tools console tab, but there is nothing in our Terminal. If we open the browser dev tools **Network** tab we can see that there are no calls to the backend

#### React Server Action and Function

We will change that by making our Action a Server Action:

```tsx title="/components/chat/MessageInput.tsx"
'use server'

const submitAction = (formData: FormData) => {
    // use the entries (names and values) or values (only values)
    formData.entries().forEach(([name, value], index) => {
        console.log('name, value, index: ', name, value, index)
    })
}

export default submitAction
```

// TODO: we can configure some Next.js options regarding server actions: <https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions>

> [!MORE]  
> [Next.js "Server Actions and Mutations" documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)  
> [React "Server Functions / Actions" documentation](https://react.dev/reference/rsc/server-functions)  
> [React "Form action" documentation](https://react.dev/reference/react-dom/components/form)  
