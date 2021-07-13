const Hapi = require('@hapi/hapi');
const Vision = require('@hapi/vision');
const Inert = require('@hapi/inert')
const Path = require('path');
const fs = require('fs')
const fetch = require('node-fetch');
const { REPL_MODE_SLOPPY } = require('repl');

let todos = [];

const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    });

    //REGISTER INERT PLUGIN
    await server.register(Inert);
    //REGISTER VISION PLUGIN
    await server.register(Vision);

    //SETTING HANDELBARS VIEW ENGINE FOR VISION PLUGIN
    server.views({
        relativeTo: Path.join(__dirname, 'templates'),
        engines: {
            hbs: require('handlebars')
        },
        isCached: false,
    });

    //GET THE INDEX PAGE WITH FOOD CATEGORY
    server.route({
        method: 'GET',
        path: '/',
        handler: async function(request, h) {
            let data = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');
            let json = await data.json();

            return h.view('index', {
                categories: json.categories
            });
        }
    });

    //GET THE MEALS PAGE WITH ALL MEALS LISTED BY CATEGORIES
    server.route({
        method: 'GET',
        path: '/mealCategory/{strCategory}',
        handler: async function(request, h) {
            const category = request.params.strCategory
            let data = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
            let json = await data.json()
            console.log(json)

            return h.view('meals', {
                meals: json.meals
            })
                
        }
    })

    //GET THE MEAL PAGE WITH ALL THE DETAILS ABOUT THE SELECTED MEAL
    server.route({
        method: 'GET',
        path: '/mealId/{idMeal}',
        handler: async function(request, h) {
            const idMeal = request.params.idMeal
            let data = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`)
            let json = await data.json()

            return h.view('mealPage', {
                meals: json.meals[0]
            })
                
        }
    })

    //SHOW ERROR 404 WHEN TRYING TO ACCES AN UNEXISTING ROUTE
    server.route({
        method: 'GET',
        path: '/{path*}',
        handler: function(request, h) {
            return h.view('404').code(404)
            
        }
    })

    //GET CSS FILE FROM PUBLIC FOLDER
    server.route({  
        method: 'GET',
        path: '/css/{file*}',
        handler: {
          directory: { 
            path: '../public/css'
          }
        }
      })

    //GET JS FILE FROM PUBLIC FOLDER
    server.route({  
        method: 'GET',
        path: '/js/{file*}',
        handler: {
          directory: { 
            path: '../public/js'
          }
        }
      })

      //POST A TO DO 
      server.route({
          method: 'POST',
          path: '/addToDos',
          handler: function(request, h) {
              const {input} = request.payload
              
              if (fs.existsSync('todos.json')) {
                  let data = fs.readFileSync('todos.json')
                  let json = JSON.parse(data)
                  
                  json.push({
                      "todo": input
                  })
                  console.log(json)
                 fs.writeFileSync('todos.json', JSON.stringify(json))
              } else {
                todos.push({
                    "todo": input
                })
                fs.writeFileSync('todos.json', JSON.stringify(todos))
              }
              return h.response().code(200)
          }
      })

      //GET TODOS
      server.route({
          method: 'GET',
          path: '/getToDos',
          handler: function(request, h) {
            let error = {
                error: 'No file'
            }
            if(fs.existsSync('todos.json')){
                let data = fs.readFileSync('todos.json')
                let json = JSON.parse(data)

                return h.response(json).code(200)    
            } else {
                return h.response(error)
            }
            
          }
      })

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();