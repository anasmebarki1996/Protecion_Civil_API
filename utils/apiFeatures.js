class APIFeatures {

    constructor(query, queryString) {
        this.query = query,
            this.queryString = queryString;
    }

    filter() {
        //1A) Filtring
        const queryObj = {
            ...this.queryString
        };
        const execludedFields = ['page', 'sort', 'limit', 'fields']
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
            const sortBy = req.query.sort.split(',').join(' ');
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
        const page = this.queryString.page * 1 | 1;
        const limit = this.queryString.limit * 1 | 10;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;

    }
}

module.exports = APIFeatures;