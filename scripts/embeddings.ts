import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { MarkdownTextSplitter } from 'langchain/text_splitter'
import path from 'node:path'
import { type Document } from 'langchain/document'
import { OllamaEmbeddings, type OllamaEmbeddingsParams } from '@langchain/ollama'

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

async function embeddingChunks(chunks: Document[]) {
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
        const vectors = await embeddingChunks(chunks)
        console.log('vectors created: ', vectors[0].length)
    } catch (error) {
        console.error('Error processing documents:', error)
    }
}

await main()