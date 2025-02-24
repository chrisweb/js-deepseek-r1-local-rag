import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import path from 'node:path'

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

async function main() {

    try {
        const documentsPath = 'docs'
        const documents = await loadDocuments(documentsPath)
        console.log('documents loaded: ', documents.length)
    } catch (error) {
        console.error('Error: ', error)
    }
}

await main()