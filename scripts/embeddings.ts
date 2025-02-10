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