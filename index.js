
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
        method: 'post',
        path: '/dogs',
        config: {
            auth: false,
            tags: ['api'],
            validate: {
                payload: {
                    name: Joi.string().required(),
                },
            },
            description: 'Authenticate an admin, returns an auth cookie'
        },
        handler: async (request) => {

            const { Dog } = request.models();
            console.log(request.payload)
            return await Dog.query().insert(request.payload);
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

    // server.schwifty(
    //     class MainClass extends Schwifty.Model {

    //         validate(){
    //             console.log('validate')
    //         }
    //         insert() {
    //             console.log('MainClass insert')
    //             this.validate()
    //             super.insert()
    //             this.postInsert()
    //         }

    //         postInsert(){
    //             console.log('postInsert')
    //         }

    //     }
    // );

    server.schwifty(
        class Dog extends Schwifty.Model  {
            static get tableName() {

                return 'Dog';
            }

            insert() {
                console.log('called')
                super.insert()
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

    // await knex.schema.createTable('Dog', (table) => {

    //     table.increments('id').primary();
    //     table.string('name');
    // });

    // ... then add some records ...

    const { Dog } = server.models();

    // await Promise.all([
    //     Dog.query().insert({ name: 'Guinness' }),
    //     Dog.query().insert({ name: 'Sully' }),
    //     Dog.query().insert({ name: 'Ren' })
    // ]);

    // ... then start the server!

    await server.start();

    console.log(`Now, go find some dogs at ${server.info.uri}!`);
})();