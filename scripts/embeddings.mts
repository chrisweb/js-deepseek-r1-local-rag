import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import path from 'node:path'
import { MarkdownTextSplitter } from 'langchain/text_splitter'
import { type Document } from 'langchain/document'
import { OllamaEmbeddings, type OllamaEmbeddingsParams } from '@langchain/ollama'

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

async function processChunks(chunks: Document[]) {
    const embeddingModel = getEmbeddingModel()
    const chunksContent = chunks.map(chunk => chunk.pageContent)
    const embeddings = await embeddingModel.embedDocuments(chunksContent)
    return embeddings
}

function getEmbeddingModel() {
    const options: OllamaEmbeddingsParams = {
        // https://ollama.com/library/nomic-embed-text
        model: 'nomic-embed-text:latest',
        //model: 'deepseek-r1:1.5b',
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
        const chunks = await chunkNorris(documents)
        console.log('chunks created: ', chunks.length)
        const embeddings = await processChunks(chunks)
        console.log('embeddings created: ', embeddings.length)
    } catch (error) {
        console.error('Error: ', error)
    }
}

await main()