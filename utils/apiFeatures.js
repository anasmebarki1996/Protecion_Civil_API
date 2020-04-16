class APIFeatures {

    constructor(query, queryString) {
        this.query = query,
            this.queryString = queryString;
    }

    search() {
        if (this.queryString.search) {
            var queryArray = [];
            for (var property in this.query.schema.paths) {
                if (this.query.schema.paths.hasOwnProperty(property) && this.query.schema.paths[property]["instance"] === "String") {
                    queryArray.push(JSON.parse('{\"' + property + '\": {\"$regex\":\"' + this.queryString.search + '\",\"$options\": \"i\"}}'))
                }
            }
            var queryStr = {
                $or: queryArray
            };
            this.query = this.query.find(queryStr);
        }
        return this;
    }

    filter() {
        //1A) Filtring
        const queryObj = {
            ...this.queryString
        };
        const execludedFields = ['page', 'sort', 'limit', 'fields', 'search']
        execludedFields.forEach(el => delete queryObj[el])
        // 1B) Advanced filtring
        // \b to match the exact word
        // g to execute multiple time
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        // if we have Desc sorting we should put -sort like -Age
        // link http:// ......?sort=price,age
        // query sort function query.sort(price age)
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy)
        } else {
            this.query = this.query.sort('createdAt')
        }
        return this;

    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields)
        } else {
            this.query = this.query.select('-__v')
        }
        return this;

    }
    paginate() {
        const page = this.queryString.page ? parseInt(this.queryString.page) : 1;
        const limit = this.queryString.limit ? parseInt(this.queryString.limit) : 10;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }

}

module.exports = APIFeatures;