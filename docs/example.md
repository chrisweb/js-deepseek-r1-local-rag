# Hello World!

## How to our custom Datalayer

This project uses a Datalayer which serves as an abstraction layer for everything related to fetching or writing data

To use the datalayer in your react components you must first import the datalayer module

```
import Datalayer from '@/datalayer/core'

const MyComponent: React.FC = () => {

    const document = Datalayer.get('docs/bar')

    return (
        <>
            {document}
        </>
    )
}

export default MyComponent
```