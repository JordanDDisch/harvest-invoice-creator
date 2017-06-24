var express = require('express');
var request = require('request');
var dotenv = require('dotenv').config();
var Harvest = require('harvest');
var Twig = require("twig");
var	harvest = new Harvest({
    subdomain: process.env.HARVEST_SUBDOMAIN,
    email: process.env.HARVEST_EMAIL,
    password: process.env.HARVEST_PASSWORD
  });
var Reports = harvest.Reports;
var Projects = harvest.Projects;
var People = harvest.People;
var app = express();

app.set('views', __dirname + '/public/views');
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'twig');

var userID = 1657332;

var getTimeEntries = new Promise(function(resolve, reject) {
  Reports.timeEntriesByUser({
    user_id: userID,
    from: '20170501',
    to: "20170531"
  }, function(err, tasks) {
    if (err) throw new Error(err);

    resolve(tasks);
  });
})

function getProjects(projectId) {
  return new Promise(function(resolve, reject) {
    Projects.get({id: projectId}, function(err, tasks) {
      if (err) throw new Error(err);
      resolve(tasks);
    })
  })
}

function setProjects(tasks) {
  return Promise.all(tasks.map(function(task) {
    return getProjects(task.day_entry.project_id);
  })).then(function(projects) {
    return {
      tasks: tasks,
      projects: projects
    };
  });
}

function mapProjects(obj) {
  for(var i = 0; i < obj.tasks.length; i++) {
    obj.tasks[i].day_entry['project_name'] = obj.projects[i].project.name;

  }
  return obj.tasks;
}

function getUsers(tasks) {
  return new Promise(function(resolve, reject) {
    People.get({id: userID}, function(err, user) {
      if (err) throw new Error(err);
      console.log(user);
      resolve(user);
    })
  })
}

app.get('/', function (req, res) {

  getTimeEntries.then(setProjects)
  .then(mapProjects)
  .then()
  .then(function(tasks) {
    console.log(tasks)
    res.render('index.twig', {
      data: tasks
    });
  });
})

console.log("App running on port: 3000");
app.listen(3000);
