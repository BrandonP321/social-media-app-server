const arr = [
    {
        one: 'hi'
    },
    {
        one: 'hello'
    }
]

for (let thing of arr) {
    thing.test = 'hi'
}

console.log(arr)