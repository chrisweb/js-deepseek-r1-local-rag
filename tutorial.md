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

### Chat UI using MUI Material and Pigment CSS

We will use [MUI](https://mui.com/core/) **Material** for this project, but if you prefer [Tailwind 4](https://github.com/tailwindlabs/tailwindcss) (with [shadcn/ui](https://ui.shadcn.com/docs/cli)
(using their new CLI) or [daisyUI](https://github.com/saadeghi/daisyui)) would of course work too

> [!MORE]  
> [MUI "Material UI"](https://mui.com/material-ui/)  
> [Pigment CSS Readme](https://github.com/mui/pigment-css)  

#### Installation

For a default installation MUI recommends installing the following packages:

```shell
npm i @mui/material @pigment-css/react @mui/material-pigment-css --save-exact
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

> [!MORE]  
> [Next.js "Server Actions and Mutations" documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)  
> [React "Server Functions / Actions" documentation](https://react.dev/reference/rsc/server-functions)  
> [React "Form action" documentation](https://react.dev/reference/react-dom/components/form)  
