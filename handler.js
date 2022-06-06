const { getUserRevenueByMonth,
    getGroupRevenueByMonth, getUserRevenueYear } = require('./repo/db');

const getUserRevenue = async function (params) {
    return await getUserRevenueByMonth(params);
}

const getGroupRevenue = async function (params) {
    return await getGroupRevenueByMonth(params);
}

const getUserRevenueByYear = async function (params) {
    return await getUserRevenueYear(params);
}

module.exports = { getUserRevenue, getGroupRevenue, getUserRevenueByYear }