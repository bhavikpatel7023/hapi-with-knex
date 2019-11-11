// 'use strict';

// const Hapi = require('@hapi/hapi');
// const Joi = require('joi');
// const Schwifty = require('schwifty');

// const init = async () => {

//     const server = Hapi.server({
//         port: 3000,
//         host: 'localhost'
//     });

//     await server.register({
//         plugin: Schwifty
//     });

//     // const bookshelf = require('bookshelf')(knex)

//     // class BaseClass extends bookshelf.Model {
//     //     // convert snake_case to camelCase
//     //     validate() {
//     //         console.log(' validate called');


//     //     }

//     //     save() {
//     //         console.log("save called")
//     //         this.validate()
//     //         this.before_save()
//     //         console.log(this)
//     //         super.save()

//     //     }
//     //     before_save() {
//     //         console.log(' before_save called');
//     //     }
//     // }



//     // // custom_model.js
//     // class Test extends BaseClass {
//     //     constructor(name, email) {
//     //         super()
//     //         this.name = name;
//     //         this.email = email;
//     //     }
//     //     get tableName() {
//     //         return 'test';
//     //     }

//     // }

//     server.schwifty(
//         class Test extends Schwifty.Model {
//             static get tableName() {

//                 return 'test';
//             }

//             static get joiSchema() {

//                 return Joi.object({
//                     name: Joi.string(),
//                     email: Joi.string()
//                 });
//             }
//         }
//     );

//     await server.initialize();
//     const knex = require('knex')({
//         client: 'pg',
//         plugin: Schwifty,
//         connection: {
//             host: '127.0.0.1',
//             user: 'postgres',
//             password: 'postgres',
//             database: 'postgres',
//             charset: 'utf8'
//         }
//     })

//     server.route({
//         method: 'GET',
//         path: '/',
//         handler: (request, h) => {

//             return 'Server is running';
//         }
//     });

//     server.route({
//         method: 'POST',
//         path: '/test/create',
//         config: {
//             auth: false,
//             tags: ['api'],
//             validate: {
//                 payload: {
//                     name: Joi.string().required(),
//                     email: Joi.string().email(),
//                 },
//             },
//             description: 'Authenticate an admin, returns an auth cookie'
//         },
//         handler: (request, h) => {
//             try {
//                 console.log(request.payload)
//                 const { Test } = request.models();

//                 return Test.query().fetchAll();
//             } catch (e) {
//                 return e
//             }
//         }
//     });

//     server.route({
//         method: 'GET',
//         path: '/test/list',
//         handler: (request, h) => {

//             return new Test().fetchAll()
//         }
//     });


//     await server.start();
//     console.log('Server running on %s', server.info.uri);
// };

// process.on('unhandledRejection', (err) => {

//     console.log(err);
//     process.exit(1);
// });

// init();

'use strict';

const Hapi = require('@hapi/hapi');
const Joi = require('joi');
const Schwifty = require('schwifty');

(async () => {

    const server = Hapi.server({ port: 3000 });

    server.route({
        method: 'get',
        path: '/dogs/{id}',
        handler: async (request) => {

            const { Dog } = request.models();

            return await Dog.query().findById(request.params.id);
        }
    });

    server.route({
        method: 'get',
        path: '/dogs/list',
        handler: async (request) => {

            const { Dog } = request.models();

            return await Dog.query();
        }
    });

    await server.register({
        plugin: Schwifty,
        options: {
            knex: {
                client: 'pg',
                useNullAsDefault: true,
                connection: {
                    host: '127.0.0.1',
                    user: 'postgres',
                    password: 'postgres',
                    database: 'postgres',
                    charset: 'utf8'
                }
            }
        }
    });

    // Register a model with schwifty...

    server.schwifty(
        class Dog extends Schwifty.Model {
            static get tableName() {

                return 'Dog';
            }

            static get joiSchema() {

                return Joi.object({
                    id: Joi.number(),
                    name: Joi.string()
                });
            }
        }
    );

    await server.initialize();

    // ... then make a table ...

    const knex = server.knex();

    await knex.schema.createTable('Dog', (table) => {

        table.increments('id').primary();
        table.string('name');
    });

    // ... then add some records ...

    const { Dog } = server.models();

    await Promise.all([
        Dog.query().insert({ name: 'Guinness' }),
        Dog.query().insert({ name: 'Sully' }),
        Dog.query().insert({ name: 'Ren' })
    ]);

    // ... then start the server!

    await server.start();

    console.log(`Now, go find some dogs at ${server.info.uri}!`);
})();