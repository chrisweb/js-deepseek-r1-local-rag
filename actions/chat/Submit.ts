'use server'

const submitAction = (formData: FormData) => {
    // use the entries (names and values) or values (only values)
    formData.entries().forEach(([name, value], index) => {
        console.log('name, value, index: ', name, value, index)
    })
}

export default submitAction