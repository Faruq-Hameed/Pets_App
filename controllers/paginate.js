//joi schema for pagination
const Joi = require('joi')
function schema(input) {
    const result = Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).default(3),
    })
    return result.validate(input)// returning a validated value
}

function paginationError(array,req){
    const validation = schema(req.query)

    if (validation.error) {
        let response = { status: 422, message: validation.error.details[0].message }//if the validation is not successful
        return response;
    }

    //if the database provide is undefined or empty
    if (!array || array.length === 0) {
        let response = { status: 204, message: 'no item available'}
        return response;
    }

    const { page, limit } = validation.value  //using the validated input from the schema

    // incase the client is requesting for an exceeded limit or page number

    if(page >Math.ceil(array.length / limit)){
        let response = { status: 404, message: `you have exceeded the maximum page of ${Math.ceil(array.length / limit)}`}
        return response;
    }

}

function paginate(array, req, items) {
    const validation = schema(req.query)

    const { page, limit } = validation.value  //using the validated input from the schema
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    let result = {}
    // designing result object structure
    const totalPages = () => {
        const operationResult = (array.length / limit)
        if (!Number.isInteger(operationResult)) {// if the division result is a float value
            return Math.ceil(operationResult)
        }
        return operationResult
    }

    result.totalPages = totalPages() //using the return value of the function
    if (startIndex > 0) { //if another page(s) exist before the current page        
        result.previousPage = page - 1
    }

    result.currentPage = page  //the present page that is being displayed

    if (endIndex < array.length) { // if we have more page(s) after the current page
        result.nextPage = page + 1
    }

    result.limit = limit //limit as specified in the request. The maximum number of items per page 

    result[items + 'List'] = array.slice(startIndex, endIndex)//returning the specified portion of the users array
    return result

}

module.exports = {paginate, paginationError}