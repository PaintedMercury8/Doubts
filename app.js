var format = require("date-fns/format");
const express = require("express");
const app = express();
var isValid = require("date-fns/isValid");
app.use(express.json());

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

const { open } = require("sqLite");
const sqLite3 = require("sqlite3");

let db;
const initializeAndStart = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqLite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  } catch (error) {
    console.log(error);
    process.exit(-1);
  }
};

initializeAndStart();

const validateDate = (request, response, next) => {
  const { date } = request.query;
  const result = isValid(new Date(date));
  console.log(result);
  if (result === true) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    request.resultDate = newDate;
    next();
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
};
const possiblePriority = ["HIGH", "MEDIUM", "LOW", ""];
const possibleStatus = ["TO DO", "IN PROGRESS", "DONE", ""];
const possibleCategory = ["WORK", "HOME", "LEARNING", ""];

const validateData = (request, response, next) => {
  const {
    id = "",
    todo = "",
    priority = "",
    status = "",
    category = "",
    dueDate = "2022-02-02",
  } = request.body;
  const result = isValid(new Date(dueDate));
  if (possiblePriority.includes(priority) === false) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (possibleStatus.includes(status) === false) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (possibleCategory.includes(category) === false) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (result === false) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    next();
  }
};

//Api 1//
app.get("/todos/", async (request, response) => {
  const {
    status = "",
    priority = "",
    search_q = "",
    category = "",
  } = request.query;
  let getQuery;
  if (status !== "" && priority === "" && search_q === "" && category === "") {
    if (possibleStatus.includes(status) === true) {
      getQuery = `select id,todo,priority,status,category,due_date as dueDate from todo where status = '${status}';`;
      const result = await db.all(getQuery);
      response.send(result);
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (
    status === "" &&
    priority !== "" &&
    search_q === "" &&
    category === ""
  ) {
    if (possiblePriority.includes(priority) === true) {
      getQuery = `select id,todo,priority,status,category,due_date as dueDate from todo where priority = '${priority}';`;
      const result = await db.all(getQuery);
      response.send(result);
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (
    status !== "" &&
    priority !== "" &&
    search_q === "" &&
    category === ""
  ) {
    if (
      possiblePriority.includes(priority) === true &&
      possibleStatus.includes(status) === true
    ) {
      getQuery = `select id,todo,priority,status,category,due_date as dueDate from todo where priority = '${priority}' AND status = '${status}';`;
      const result = await db.all(getQuery);
      response.send(result);
    } else {
      response.status(400);
      if (possiblePriority.includes(priority) === false) {
        response.send("Invalid Todo Priority");
      } else if (possiblePriority.includes(status) === false) {
        response.send("Invalid Todo Status");
      }
    }
  } else if (
    status === "" &&
    priority === "" &&
    search_q !== "" &&
    category === ""
  ) {
    getQuery = `select id,todo,priority,status,category,due_date as dueDate from todo where todo LIKE '%${search_q}%';`;
    const result = await db.all(getQuery);
    response.send(result);
  } //Scenario 5//
  else if (
    status !== "" &&
    priority === "" &&
    search_q === "" &&
    category !== ""
  ) {
    if (
      possibleCategory.includes(category) === true &&
      possibleStatus.includes(status) === true
    ) {
      getQuery = `select id,todo,priority,status,category,due_date as dueDate from todo where category = '${category}' AND status = '${status}';`;
      const result = await db.all(getQuery);
      response.send(result);
    } else {
      response.status(400);
      if (possibleCategory.includes(category) === false) {
        response.send("Invalid Todo Category");
      } else if (possibleStatus.includes(status) === false) {
        response.send("Invalid Todo Status");
      }
    }
  } //Scenario 6//
  else if (
    status === "" &&
    priority === "" &&
    search_q === "" &&
    category !== ""
  ) {
    if (possibleCategory.includes(category) === true) {
      getQuery = `select id,todo,priority,status,category,due_date as dueDate from todo where category = '${category}';`;
      const result = await db.all(getQuery);
      response.send(result);
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } //Scenario 7//
  else if (
    status === "" &&
    priority !== "" &&
    search_q === "" &&
    category !== ""
  ) {
    if (
      possibleCategory.includes(category) === true &&
      possiblePriority.includes(priority) === true
    ) {
      getQuery = `select id,todo,priority,status,category,due_date as dueDate from todo where category = '${category}' AND priority = '${priority}';`;
      const result = await db.all(getQuery);
      response.send(result);
    } else {
      response.status(400);
      if (possibleCategory.includes(category) === false) {
        response.send("Invalid Todo Category");
      } else if (possiblePriority.includes(priority) === false) {
        response.send("Invalid Todo Priority");
      }
    }
  }
});

//Api 2//

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodo = `select id,todo,priority,status,category,due_date as dueDate from todo where id = ${todoId};`;
  const result = await db.get(getTodo);
  response.send(result);
});

//Api 3//
app.get("/agenda/", validateDate, async (request, response) => {
  const { resultDate } = request;
  console.log(resultDate);
  const dueQuery = `select id,todo,priority,status,category,due_date as dueDate from todo where strftime("%Y-%m-%d",dueDate) = "${resultDate}";`;
  const result = await db.all(dueQuery);
  console.log(dueQuery);
  response.send(result);
});

//Api 4//
app.post("/todos/", validateData, async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const newDate = format(new Date(dueDate), "yyyy-MM-dd");
  const postQuery = `INSERT INTO todo (id,todo,priority,status,category,due_date)
  VALUES(
      ${id},
      '${todo}',
      '${priority}',
      '${status}',
      '${category}',
      '${newDate}'
  );`;
  const result = await db.run(postQuery);
  response.send("Todo Successfully Added");
});

//Api 5//
app.put("/todos/:todoId/", validateData, async (request, response) => {
  const { todoId } = request.params;
  const {
    status = "",
    priority = "",
    category = "",
    todo = "",
    dueDate = "",
  } = request.body;
  console.log(status, priority, category, todo, dueDate, todoId);
  let putQuery;
  if (status !== "") {
    putQuery = `UPDATE todo SET status = '${status}' where id = ${todoId};`;
    await db.run(putQuery);
    response.send("Status Updated");
  } else if (priority !== "") {
    putQuery = `UPDATE todo SET priority = '${priority}' where id = ${todoId};`;
    await db.run(putQuery);
    response.send("Priority Updated");
  } else if (todo !== "") {
    putQuery = `UPDATE todo SET todo = '${todo}' where id = ${todoId};`;
    await db.run(putQuery);
    response.send("Todo Updated");
  } else if (category !== "") {
    putQuery = `UPDATE todo SET category = '${category}' where id = ${todoId};`;
    await db.run(putQuery);
    response.send("Category Updated");
  } else if (dueDate !== "") {
    putQuery = `UPDATE todo SET due_date = '${dueDate}' where id = ${todoId};`;
    await db.run(putQuery);
    response.send("Due Date Updated");
  }
});

//API 6//
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `delete from todo where id = ${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
