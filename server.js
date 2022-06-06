'use strict';

const express = require('express');
const seeder = require('./seed');
const { getUserRevenue, getGroupRevenue, getUserRevenueByYear } = require('./handler');

// Constants
const PORT = 3000;
const HOST = '0.0.0.0';

async function start() {
  // Seed the database
  await seeder.seedDatabase();

  // App
  const app = express();

  // Health check
  app.get('/health', (req, res) => {
    res.send('Hello World');
  });

  // Write your endpoints here
  app.get('/users/revenue/total', async (req, res) => {
    try {
      const result = await getUserRevenue(getPagination(req, "SUM"));
      res.send(result);
    } catch (err) {
      console.log('err', err);
      res.status(500).send();
    }
  });

  app.get('/users/revenue/average', async (req, res) => {
    try {
      const result = await getUserRevenue(getPagination(req, "AVG"));
      res.send(result);
    } catch (err) {
      console.log('err', err);
      res.status(500).send();
    }
  });

  app.get('/groups/revenue/total', async (req, res) => {
    try {
      const result = await getGroupRevenue(getPagination(req, "SUM"));
      res.send(result);
    } catch (err) {
      console.log('err', err);
      res.status(500).send();
    }
  });

  app.get('/groups/revenue/average', async (req, res) => {
    try {
      const result = await getGroupRevenue(getPagination(req, "AVG"));
      res.send(result);
    } catch (err) {
      console.log('err', err);
      res.status(500).send();
    }
  });

  app.get('/users/revenue/:year', async (req, res) => {
    try {
      let params = getPagination(req, "SUM");
      params[0] = req.params.year;
      const result = await getUserRevenueByYear(params);
      res.send(result);
    } catch (err) {
      console.log('err', err);
      res.status(500).send();
    }
  });

  app.listen(PORT, HOST);
  console.log(`Server is running on http://${HOST}:${PORT}`);
}

start();

const getPagination = function (req, fun) {
  const year = req.query.year;
  const month = req.query.month;
  const id = req.query.id;
  const limit = req.query.limit;
  const dir = req.query.dir;

  const params = [];
  params.push(year);
  params.push(month);
  params.push(id);
  params.push(limit);
  params.push(dir);
  params.push(fun);

  return params;
}


//   * set of eg urls!
// USERS
// TOTAL
// 1. default limit 5, default year current year
// http://localhost:3000/users/revenue/total?
// 2. default limit 5
// http://localhost:3000/users/revenue/total?year=2021
// 3. http://localhost:3000/users/revenue/total?year=2021&limit=10
// 4. next page, default dir(next)
// http://localhost:3000/users/revenue/total?year=2021&limit=10&month=2021-01-01T00:00:00.000Z&id=10
// 5. previous page
// http://localhost:3000/users/revenue/total?year=2021&limit=10&month=2021-01-01T00:00:00.000Z&id=11&dir=prev

// AVERAGE
// 1. default limit 5, default year current year
// http://localhost:3000/users/revenue/average?
// 2. default limit 5
// http://localhost:3000/users/revenue/average?year=2021
// 3. http://localhost:3000/users/revenue/average?year=2021&limit=10
// 4. next page, default dir(next)
// http://localhost:3000/users/revenue/average?year=2021&limit=10&month=2021-01-01T00:00:00.000Z&id=10
// 5. previous page
// http://localhost:3000/users/revenue/average?year=2021&limit=10&month=2021-01-01T00:00:00.000Z&id=11&dir=prev
		
// 	TOTAL BY YEAR
// 1. default limit 5
// http://localhost:3000/users/revenue/2021
// 2. http://localhost:3000/users/revenue/2021?limit=10
// 4. next page, default dir(next)
// http://localhost:3000/users/revenue/2021?limit=10&id=10
// 5. previous page
// http://localhost:3000/users/revenue/2021?limit=10&id=11&dir=prev


// GROUPS
// TOTAL
// 1. default limit 5, default year current year
// http://localhost:3000/groups/revenue/total?
// 2. default limit 5
// http://localhost:3000/groups/revenue/total?year=2021
// 3. http://localhost:3000/groups/revenue/total?year=2021&limit=10
// 4. next page, default dir(next)
// http://localhost:3000/groups/revenue/total?year=2021&limit=10&month=2021-04-01T00:00:00.000Z&id=1
// 5. previous page
// http://localhost:3000/groups/revenue/total?year=2021&limit=10&month=2021-04-01T00:00:00.000Z&id=2&dir=prev

// AVERAGE
// 1. default limit 5, default year current year
// http://localhost:3000/groups/revenue/average?
// 2. default limit 5
// http://localhost:3000/groups/revenue/average?year=2021
// 3. http://localhost:3000/groups/revenue/average?year=2021&limit=10
// 4. next page, default dir(next)
// http://localhost:3000/groups/revenue/average?year=2021&limit=10&month=2021-04-01T00:00:00.000Z&id=1
// 5. previous page
// http://localhost:3000/groups/revenue/average?year=2021&limit=10&month=2021-04-01T00:00:00.000Z&id=2&dir=prev
