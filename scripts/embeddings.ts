import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { MarkdownTextSplitter } from 'langchain/text_splitter'
import * as path from 'path'
import { type Document } from 'langchain/document'


async function loadDocuments(documentsPath: string): Promise<Document[]> {

    const loader = new DirectoryLoader(
        path.join(process.cwd(), documentsPath),
        {
            '.mdx': filePath => new TextLoader(filePath),
        }
    )

    const docs = await loader.load()

    // Initialize markdown splitter with specific configuration
    const markdownSplitter = new MarkdownTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    })

    // Split the documents into chunks
    const splitDocs = await markdownSplitter.splitDocuments(docs)

    return splitDocs
}

async function main() {
    try {
        const documentsPath = 'app/docs'
        const documents = await loadDocuments(documentsPath)
        console.log(`Processed ${String(documents.length)} document chunks`)
        // process these documents further (create embeddings)
    } catch (error) {
        console.error('Error processing documents:', error)
    }
}

await main()