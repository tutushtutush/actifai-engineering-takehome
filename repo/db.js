'use strict'

const { Client } = require('pg');

const pgclient = new Client({
    host: 'db',
    port: '5432',
    user: 'user',
    password: 'pass',
    database: 'actifai'
});

pgclient.connect();

const getUserRevenueByMonthQuery = `
    SELECT U.id AS id, 
        name,
        DATE_TRUNC('month', S.date) AS  month,
        [FUN](amount) as amount
    FROM users U
    INNER JOIN sales S ON S.user_id = U.id
    WHERE DATE_TRUNC('year', S.date) = $1
            AND ( 
                DATE_TRUNC('month', S.date) [<>] $2
                OR (
                        U.id [<>] $3 
                        AND DATE_TRUNC('month', S.date) = $2
                    )
            )
    GROUP BY U.id, month
    ORDER BY month DESC, id DESC
    LIMIT $4
`;

const getGroupRevenueByMonthQuery = `
    SELECT UG.group_id id, 
        DATE_TRUNC('month', S.date) AS  month,
        [FUN](amount) as amount
    FROM user_groups UG
    INNER JOIN users U on U.id = UG.user_id
    INNER JOIN sales S on S.user_id = U.id
    WHERE DATE_TRUNC('year', S.date) = $1
            AND ( 
                    DATE_TRUNC('month', S.date) [<>] $2
                    OR (
                            UG.group_id [<>] $3 
                            AND DATE_TRUNC('month', S.date) = $2
                        )
                )
    GROUP BY UG.group_id, month
    ORDER BY month DESC, UG.group_id DESC
    LIMIT $4
`;

const getUserRevenueByYear = `
    SELECT U.id AS id, 
        name,
        SUM(amount) as amount
    FROM users U
    INNER JOIN sales S ON S.user_id = U.id
     WHERE DATE_TRUNC('year', S.date) = $1
            AND ( 
                U.id [<>] $2 
            )
    GROUP BY U.id
    ORDER BY id DESC
    LIMIT $3
`;

const getUserRevenueByMonth = async function (params) {
    try {
        const query = getQuery(getUserRevenueByMonthQuery.slice(), params);
        const result = await pgclient.query(query[0], query[1]);
        return result.rows;
    } catch (err) {
        console.error(err);
        throw new Error('Some thing went wrong');
    }
}

const getGroupRevenueByMonth = async function (params) {
    try {
        const query = getQuery(getGroupRevenueByMonthQuery.slice(), params);
        const result = await pgclient.query(query[0], query[1]);
        return result.rows;
    } catch (err) {
        console.error(err);
        throw new Error('Some thing went wrong');
    }
}

const getUserRevenueYear = async function (params) {
    try {
        const query = getQueryYear(getUserRevenueByYear.slice(), params);
        const result = await pgclient.query(query[0], query[1]);
        return result.rows;
    } catch (err) {
        console.error(err);
        throw new Error('Some thing went wrong');
    }
}

const getQuery = function (query, params) {
    let queryParams = [];

    // set AVG or SUM
    query = query.replaceAll("[FUN]", params[5]);

    const year = getYear(params[0]);
    const month = getMonth(params[1], year);
    const id = getID(params[2]);
    const limit = getLimit(params[3]);
    const dir = params[4];

    queryParams.push(year);
    queryParams.push(month);
    queryParams.push(id);
    queryParams.push(limit);

    if (dir == null || dir == "next") {
        query = query.replaceAll("[<>]", ">");
        query = query.replaceAll("DESC", "");
    } else if (dir == 'prev') {
        query = query.replaceAll("[<>]", "<");
        query = `SELECT * 
                FROM (${query}) R 
                ORDER BY month, id
                `;
    }

    console.log("query", query);

    return [query, queryParams];
}

const getLimit = function (limit) {
    if (isNaN(limit) || limit < 10) {
        limit = 5;
    }

    return limit;
}

const getID = function (id) {
    if (isNaN(id) || id < 1) {
        id = 0;
    }

    return id;
}

const getMonth = function (month, year) {
    if (month == null) {
        // set month to 1st
        month = year;
    }

    //TODO: validate month

    return month;
}

const getYear = function (year) {
    if (year == null) {
        // TODO:return invalid input error, year is required
        // set current year
        year = new Date().getFullYear();
    }

    //TODO: validate year

    return `${year}-01-01T00:00:00.000Z`;
}


const getQueryYear = function (query, params) {
    let queryParams = [];
    console.log('params:', params);

    const year = getYear(params[0]);
    const id = getID(params[2]);
    const limit = getLimit(params[3]);
    const dir = params[4];

    queryParams.push(year);
    queryParams.push(id);
    queryParams.push(limit);

    if (dir == null || dir == "next") {
        query = query.replaceAll("[<>]", ">");
        query = query.replaceAll("DESC", "");
    } else if (dir == 'prev') {
        query = query.replaceAll("[<>]", "<");
        query = `SELECT * 
                FROM (${query}) R 
                ORDER BY id
                `;
    }

    console.log("query", query);

    return [query, queryParams];
}

module.exports = {
    getUserRevenueByMonth,
    getGroupRevenueByMonth,
    getUserRevenueYear
}