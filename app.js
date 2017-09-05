var express = require('express');
var request = require('request');
var dotenv = require('dotenv').config();
var Harvest = require('harvest');
var Twig = require('twig');
var cmd = require('node-cmd');
var fs = require('fs');
var pdf = require('html-pdf');
var classify = require('underscore.string/classify')
var	harvest = new Harvest({
    subdomain: process.env.HARVEST_SUBDOMAIN,
    email: process.env.HARVEST_EMAIL,
    password: process.env.HARVEST_PASSWORD
  });
var Reports = harvest.reports;
var Projects = harvest.projects;
var People = harvest.people;
var app = express();

app.set('views', __dirname + '/public/views');
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'twig');

var userID = 1657332;

var getTimeEntries = new Promise(function(resolve, reject) {
  Reports.timeEntriesByUser(userID,
  {
    from: '20170801',
    to: "20170831"
  },
  function(err, tasks) {
    if (err) throw new Error(err);
    resolve(tasks.body);
  });
})

function getProjects(projectId) {
  return new Promise(function(resolve, reject) {
    Projects.get(projectId, function(err, tasks) {
      if (err) throw new Error(err);
      resolve(tasks.body);
    })
  })
}

function calcluateTotalHours(tasks) {
  var obj = {};
  var total_hours = {}
  tasks.forEach(function(task) {
    var projectCamelizedName = classify(task.day_entry.project_name);
    if(total_hours.hasOwnProperty(projectCamelizedName)) {
      total_hours[projectCamelizedName] += task.day_entry.hours;
    } else {
      total_hours[projectCamelizedName] = task.day_entry.hours;
    }
  })
  obj['tasks'] = tasks;
  obj['total_hours'] = total_hours;
  return obj;
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
    People.get(userID, function(err, user) {
      if (err) throw new Error(err);
      resolve(user);
    })
  })
}

app.post('/render-pdf', function (req, res) {
  cmd.run('curl -0 localhost:3000 > jordanddisch-invoice.html');
  console.log('asdf');
})

app.get('/', function (req, res) {

  getTimeEntries.then(setProjects)
  .then(mapProjects)
  .then(calcluateTotalHours)
  .then(function(tasks) {
    res.render('index.twig', {
      data: tasks
    });
  });
})

console.log('App running on port: 3000');
app.listen(3000);
