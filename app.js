const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
const format = require('date-fns/format')
const isMatch = require('date-fns/isMatch')
const isvalid = require('date-fns/isValid')
app.use(express.json())

let db = null
const dbpath = path.join(__dirname, 'todoApplication.db')

const instilizeserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running http//:localhost:3000/')
    })
  } catch (error) {
    console.log(`Db Error ${error.message}`)
    process.exit(1)
  }
}
instilizeserver()
const haspriorityandstatusproperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}
const hasPriorityProperty = requestQuery => {
  return
  requestQuery.priority !== undefined
}
const hasStatusProperty = requestQuery => {
  return
  requestQuery.status !== undefined
}
const hasCategoryProperty = requestQuery => {
  return requestQuery.category !== undefined
}
const hasCategoryAndstatusproperties = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  )
}
const hasCategoryAndPrirorityProperties = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  )
}
const hasSearchProperty = requestQuery => {
  return requestQuery.search !== undefined
}

const convertdataintoResponseObj = dbobj => {
  return {
    id: dbobj.id,
    todo: dbobj.todo,
    category: dbobj.category,
    priority: dbobj.priority,
    status: dbobj.status,
    dueDate: dbobj.due_date,
  }
}

//Api 1
app.get('/todos/', async (request, response) => {
  const {search_q = '', priority, status, category} = request.query
  let data = null
  let gettodoQuery = ''
  switch (true) {
    case hasStatusProperty(request.query):
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        getTodoQuery = `SELECT * FROM todo WHERE status = ${status}`
        data = await db.all(gettodoQuery)
        response.send(data.map(each => convertdataintoResponseObj(each)))
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case haspriorityandstatuspropertis(request.query):
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status === 'DONE'
        ) {
          getTodoQuery = `SELECT * FROM todo WHERE priority = '${priority}' AND status = '${status}'`
          data = await db.all(gettodoQuery)
          response.send(data.map(each => convertdataintoResponseObj(each)))
        } else {
          response.status(400)
          response.send('Invalid Todo Status')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case hasSearchProperty(request.query):
      gettodoQuery = `SELECT * FROM todo WHERE todo LIKE '%{search_q}%`
      data = await db.all(gettodoQuery)
      response.send(data.map(each => convertdataintoResponseObj(each)))
      break
    case hasCategoryAndstatusproperties(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status === 'DONE'
        ) {
          gettodoQuery = `SELECT * FROM todo WHERE category = '${category}' AND status = '${status}'`
          data = await db.all(gettodoQuery)
          response.send(data.map(each => convertdataintoResponseObj(each)))
        } else {
          response.status(400)
          response.send('Invalid Todo Status')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case hasCategoryProperty(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        gettodoQuery = `SELECT * FROM todo WHERE category = '${category}'`
        data = await db.all(gettodoQuery)
        response.send(data.map(each => convertdataintoResponseObj(each)))
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case hasCategoryAndPrirorityProperties(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (
          priority === 'HIGH' ||
          priority === 'MEDIUM' ||
          priority === 'LOW'
        ) {
          gettodoQuery = `SELECT * FROM todo WHERE category = '${category}' AND priority = '${priority}'`
          data = await db.all(gettodoQuery)
          response.send(data.map(each => convertdataintoResponseObj(each)))
        } else {
          response.status(400)
          response.send('Invalid Todo Priority')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    default:
      gettodoQuery = `SELECT * FROM todo`
      data = await db.all(gettodoQuery)
      response.send(data.map(each => convertdataintoResponseObj(each)))
  }
})

//Api 2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = response.params
  const gettodoQuery = `
    SELECT * FROM todo WHERE id = ${todoId}`
  const res = await db.get(gettodoQuery)
  response.send(convertdataintoResponseObj(res))
})

//api3
app.get('/agenda/', async (request, response) => {
  const {date} = require.query

  if (isMatch(date, 'yyyy-MM-dd')) {
    const newDate = format(new Date(date), 'yyyy-MM-dd')
    const getTodoQuery = `SELECT * FROM todo WHERE due_date = '${newDate}'`
    const res = await db.all(getTodoQuery)
    response.send(res.map(each => convertdataintoResponseObj(each)))
  } else {
    response.status(400)
    response.send('Invalid Due Date')
  }
})

//Api 4

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body
  if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (isMatch(dueDate, 'yyyy-MM-dd')) {
          const newDueDate = format(new Date(dueDate), 'yyyy-MM-yy')
          const postquery = `INSERT INTO todo(id,todo,priority,status,category,due_date)
        VALUES ('${id}','${todo}','${priority}','${status}','${category}','${newDueDate}')`
          await db.run(postquery)
          response.send('Todo Sucessfully Added')
        } else {
          response.status(400)
          response.send('Invalid Due Date')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  } else {
    response.status(400)
    response.send('Invalid Todo Priority')
  }
})

//Api 5
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let updateColumn = ''
  const requestbody = request.body
  const getTodoQuery = `SELECT * FROM todo WHERE id = ${todoId}`
  const res = await db.get(getTodoQuery)
  const {
    todo = res.todo,
    priority = res.priority,
    status = res.status,
    category = res.category,
    dueDate = res.dueDate,
  } = request.body
  let updateTodo
  switch (true) {
    case requestbody.status !== undefined:
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        updateTodo = `UPDATE todo SET todo = '${todo}',
      priority = '${priority}',status = '${status}',category = '${category}',category = '${dueDate}',due_date = '${dueDate}' WHERE id = ${todoId}`
        await db.run(updateTodo)
        response.send('Status Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case requestBody.priority !== undefined:
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        updateTodo = `UPDATE todo SET todo = '${todo}',
      priority = '${priority}',status = '${status}',category = '${category}',category = '${dueDate}',due_date = '${dueDate}' WHERE id = ${todoId}`
        await db.run(updateTodo)
        response.send('Priority Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case requestbody.todo !== undefined:
      updateTodo = `UPDATE todo SET todo = '${todo}',
      priority = '${priority}',status = '${status}',category = '${category}',category = '${dueDate}',due_date = '${dueDate}' WHERE id = ${todoId}`
      await db.run(updateTodo)
      response.send('Todo Updated')
      break

    case requestbody.category !== undefined:
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        updateTodo = `UPDATE todo SET todo = '${todo}',
      priority = '${priority}',status = '${status}',category = '${category}',category = '${dueDate}',due_date = '${dueDate}' WHERE id = ${todoId}`
        await db.run(updateTodo)
        response.send('Category Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case requestbody.dueDate !== undefined:
      if (isMatch(dueDate, 'yyyy-MM-dd')) {
        const newDate = format(new Date(dueDate), 'yyyy-MM-dd')
        updateTodo = `UPDATE todo SET todo = '${todo}',
      priority = '${priority}',status = '${status}',category = '${category}',category = '${dueDate}',due_date = '${dueDate}' WHERE id = ${todoId}`
        await db.run(updateTodo)
        response.send('Due Date Updated')
      } else {
        response.status(400)
        response.send('Invalid Due Date')
      }
      break
  }
})
//APi 6
app.delete('/todos/todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteQuery = `DELETE FROM todo WHERE id = ${todoId}`
  await db.run(deleteQuery)
  response.send('Todo Deleted')
})
module.exports = app
