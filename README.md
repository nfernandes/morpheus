Morpheus - notification service
=================================

DEVELOPMENT ENVIRONMENT SETUP
----------------------------------------------

You need to have 

*NodeJS 

*MongoDB 


SETUP
---------------

Create a directory `morpheus` and run the following command:

`git clone https://github.com/nfernandes/morpheus.git`

`npm install`

`npm start ` - run main server and funcionality

Morpheus should be up and running on `http://localhost:3000`


Project structure
---------------
- index.js that contains the server that will kick start the project, after we have the following structure:

**configurations**
Environment configurations allowing to use specific variables depending on the project environment at the time.
In AWS we would set up the correct node.process.env indicating which env file to use (i would have one for test, stage, prod).

**controllers**
Contain the api functionalities for the routes defined.

**middleware**
Middleware with authentication (checking if authentication is valid). In this case we can for instance use Json Web Token, because this updates could be use between systems so would be a secure and easy way to make authentication between systems.

**modules**
Mongodb modules used, in this case emails.

**routes**
The api paths defined for the project.

**utils**
Extra functionalities that we can use as helpers for the controllers and that can be use in several controllers. 

In this case i am using a template for the responses, to guarantee that we send always the send type of structure in the response. It is good in case other systems use it. 

I am also using an email sender functionality based on nodemailer. I selected nodemailer because it is a reliable service easy to use and to set up.


TODO
---------------
- possible to create email templates, those case be made using handelbars with placeholders to allow easy usage of them. this would make easier to send updates (standard messages)

- 