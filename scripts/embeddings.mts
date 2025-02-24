import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import path from 'node:path'
import { MarkdownTextSplitter } from 'langchain/text_splitter'
import { type Document } from 'langchain/document'

async function loadDocuments(documentsPath: string) {

    const loader = new DirectoryLoader(
        path.join(process.cwd(), documentsPath),
        {
            '.md': filePath => new TextLoader(filePath),
            '.mdx': filePath => new TextLoader(filePath),
        }
    )

    const docs = await loader.load()

    return docs

}

async function chunkNorris(documents: Document[]) {

    // for each document extract the frontmatter from page content as json
    /*documents.forEach((document) => {
        console.log(document.metadata)
        const frontmatter = document.pageContent.match(/---([\s\S]*?)---/)
        if (frontmatter) {
            const yamlContent = frontmatter[1]
            // using a library like js-yaml
            // https://www.npmjs.com/package/js-yaml
            // to transform the frontmatter yaml to json
            // later you might want to use some of that semantic
            // frontmatter data to give the ai custom instructions in the prompt
        }
    })*/

    // for each document remove the frontmatter
    documents.forEach((document) => {
        document.pageContent = document.pageContent.replace(/---[\s\S]*?---/, '')
    })

    const markdownSplitter = new MarkdownTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 0,
    })

    // to get an idea what the default separators are
    //console.log(MarkdownTextSplitter.getSeparatorsForLanguage('markdown'))

    // custom markdown separators
    markdownSplitter.separators = [
        '\n## ', // h2 headers
        '\n### ', // h3 headers
        //'\n#{1,6}s', // h1-h6 headers
        '\n```', // code blocks
        '\n\n', // paragraphs
        '\n', // line breaks
    ]

    const chunks = await markdownSplitter.splitDocuments(documents)

    return chunks
}

async function main() {

    try {
        const documentsPath = 'docs'
        const documents = await loadDocuments(documentsPath)
        console.log('documents loaded: ', documents.length)
        const chunks = await chunkNorris(documents)
        console.log('chunks created: ', chunks.length)
    } catch (error) {
        console.error('Error: ', error)
    }
}

await main()