'use strict';

const Hapi = require('@hapi/hapi');
const Joi = require('joi');

const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });
    const knex = require('knex')({
        client: 'pg',
        connection: {
          host : 'localhost',
          user : 'postgres',
          password : 'postgres',
          database : 'postgres'
        }
      });
    // await knex.schema.createTable('test1', (table) => {

    //     table.increments('id').primary();
    //     table.string('name');
    //     table.string('email');
    // });

    const bookshelf = require('bookshelf')(knex)

    class BaseClass extends bookshelf.Model {
        validate() {
            console.log(' validate called');
        }

        before_save() {
            console.log('BaseClass before_save called');
        }

        insert() {
            try{
            console.log("save called")
            this.validate()
            this.before_save()
            console.log(this.changed)
            let res = this.query().insert(this.changed)
            this.after_save()
             return res
            }catch(e){
                console.log(e)
            }

        }

        after_save() {
            console.log(' after_save called');
        }
    }

    // custom_model.js
    class Test extends BaseClass {
        // constructor(name, email) {
        //     super()
        //     this.name = name;
        //     this.email = email;
        // }

        validate(){
            console.log(' Test custom validation called');
        }

        get tableName() {
            return 'test1';
        }

        after_save() {
            console.log(' Test Log created');
        }
    }


    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {

            return 'Server is running';
        }
    });

    server.route({
        method: 'POST',
        path: '/test/create',
        config: {
            auth: false,
            tags: ['api'],
            validate: {
                payload: {
                    name: Joi.string().required(),
                    email: Joi.string().email(),
                },
            },
            description: 'Authenticate an admin, returns an auth cookie'
        },
        handler: (request, h) => {
            try {
                console.log(request.payload)
                return new Test(request.payload).insert()
            } catch (e) {
                return e
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/test/list',
        handler: (request, h) => {

            return new Test().query()
        }
    });


    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
