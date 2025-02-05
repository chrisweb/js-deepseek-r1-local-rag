# AI tutorial

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

> [!MORE]  
> [Ollama Readme](https://github.com/ollama/ollama)  

## Next.js 15 and React 19

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

### Chat UI using MUI Material

We will use [MUI](https://mui.com/core/) **Material** for this project, but if you prefer [Tailwind 4](https://github.com/tailwindlabs/tailwindcss) (with [shadcn/ui](https://ui.shadcn.com/docs/cli)
(using their new CLI) or [daisyUI](https://github.com/saadeghi/daisyui)) would of course work too

For a default installation MUI recommends installing the following packages:

```shell
npm i @mui/material @pigment-css/react --save-exact
```

and then also dev dependencies:

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

Or you could run the npm installation command for pigment-css nextjs-plugin using the **force flag** like so:

```shell
npm i @pigment-css/nextjs-plugin --save-exact --save-dev --force
```

For the icons we will use [lucide-react](https://lucide.dev/packages), so make sure that package is installed too:

```shell
npm i lucide-react --save-exact
```

TODO: do we need lucide? do we need the mui icons? do we install the material icons google font: https://fonts.google.com/icons?icon.set=Material+Icons (if we install the font we need to use [next font](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts))
TODD: mui uses the robot font, do we add it using [next font](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts)?

Next we update the code of the page to add some UI components:

```tsx title="/app/page.tsx"
import styles from './page.module.css'

export default function Home() {
    return (
        <div className={styles.page}>
            
        </div>
    )
}
```

> [!MORE]  
> [mui installation documentation](https://mui.com/material-ui/getting-started/installation/)  
> [pigment-css Next.js example](https://github.com/mui/pigment-css/tree/master/examples/pigment-css-nextjs-ts)