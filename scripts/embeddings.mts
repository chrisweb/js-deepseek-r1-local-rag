import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import path from 'node:path'
import { MarkdownTextSplitter } from 'langchain/text_splitter'
import { type Document } from 'langchain/document'
import { OllamaEmbeddings, type OllamaEmbeddingsParams } from '@langchain/ollama'
import { PGVectorStore, type PGVectorStoreArgs } from '@langchain/community/vectorstores/pgvector'
import pg, { type PoolConfig, type Pool as PoolType } from 'pg'
import yaml from 'js-yaml'

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

    documents.forEach((document) => {
        const frontmatter = document.pageContent.match(/---([\s\S]*?)---/)
        if (frontmatter) {
            const yamlContent = frontmatter[1]
            const frontmatterData = yaml.load(yamlContent)
            document.metadata.frontmatter = frontmatterData
            //console.log('document.metadata: ', document.metadata)
        }
    })

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

export function createPool(): PoolType {

    const postgresOptions: PoolConfig = {
        host: '127.0.0.1',
        port: 5432,
        user: 'postgres',
        password: '123',
        database: 'vector_store',
    }

    const pool = new pg.Pool(postgresOptions)

    return pool
}

async function storeVectors(vectors: number[][], chunks: Document[], pgPool: PoolType) {
    const embeddings = getEmbeddingModel()
    const options: PGVectorStoreArgs = {
        pool: pgPool,
        tableName: 'vectors',
        columns: {
            idColumnName: 'id',
            vectorColumnName: 'vector',
            contentColumnName: 'content',
            metadataColumnName: 'metadata',
        },
        // note to self: supported distance strategies: cosine (default),
        // innerProduct, or euclidean
        distanceStrategy: 'cosine',
    }
    const vectorStore = await PGVectorStore.initialize(embeddings, options)
    await vectorStore.addVectors(vectors, chunks)
    return vectorStore
}

async function endVectorStorePool(vectorStore: PGVectorStore) {
    // closes all clients and then releases the pg pool
    await vectorStore.end()
}

async function main() {

    const pgPool = createPool()

    pgPool.on('error', (error) => {
        console.error('Unexpected error on idle client', error)
        process.exit(-1)
    })

    try {
        const documentsPath = 'docs'
        const documents = await loadDocuments(documentsPath)
        console.log('documents loaded: ', documents.length)
        const chunks = await chunkNorris(documents)
        console.log('chunks created: ', chunks.length)
        const embeddings = await processChunks(chunks)
        console.log('embeddings created: ', embeddings.length)
        const vectorStore = await storeVectors(embeddings, chunks, pgPool)
        console.log('vectors stored')
        await endVectorStorePool(vectorStore)
        console.log('postgres pool released')
    } catch (error) {
        console.error('Error: ', error)
    }
}

await main()