const str = 'brandonp321'



let query = 'brandon'
const regex = new RegExp(`${query}`, 'i')

let result = regex.test(str)


console.log(result)