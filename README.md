Morpheus - notification service, sending update emails
=================================

DEVELOPMENT ENVIRONMENT SETUP
----------------------------------------------

You need to have 

- NodeJS 

- MongoDB 


SETUP
---------------

Create a directory `morpheus` and run the following command:

`git clone https://github.com/nfernandes/morpheus.git`

`npm install`

`npm start ` - run main server and functionalities

Morpheus should be up and running on `http://localhost:3000`


Project structure
---------------
index.js that contains the server that will kick start the project, after we have the following structure:

**configurations**

Environment configurations allowing to use specific variables depending on the project environment at the time.
In AWS we would set up the correct node.process.env indicating which env file to use (i would have one for test, stage, prod).

**controllers**

Contain the api functionalities for the routes defined.

**middleware**
Middleware with authentication (checking if authentication is valid). In this case we can for instance use Json Web Token, because this updates could be use between systems so would be a secure and easy way to make authentication between systems.

**modules**

Mongodb modules used, in this case emails. The email module is already prepared to do pagination to have attachment etc. 

**routes**

The api paths defined for the project.

**utils**

Extra functionalities that we can use as helpers for the controllers and that can be use in several controllers. 
In this case, i am using a template for the responses, to guarantee that we send always the same type of structure in the response. Allows easier collaboration with other systems. 
I am also using an email sender functionality based on nodemailer. I selected nodemailer because it is a reliable service easy to use and to set up.


TODO
---------------
- possible to create email templates, those case be made using handelbars with placeholders to allow easy usage of them. this would make easier to send updates (standard messages)

- 

Sample of usage
----------------


**Create update message**

POST http://localhost:3000/api/emails

BODY :

~~~~
{
  "from": "email@itpx.one",
  "to": "emailto@gmail.com",
  "text":"update message",
  "html": "<html><head></head><body>update message</body></html>",
  "subject":"update title"
}
~~~~

Response Sample

~~~~
{
    "data": {
        "to": [
            "emailto.com"
        ],
        "cc": [],
        "bcc": [],
        "attachment": [],
        "attachmentFileName": [],
        "isBounced": false,
        "_id": "5bdda9594a8880ddf4fad26d",
        "from": "nadia@itpx.one",
        "subject": "update title",
        "text": "update message",
        "html": "<html><head></head><body>update message</body></html>",
        "createdAt": "2018-11-03T13:57:45.135Z",
        "updatedAt": "2018-11-03T13:57:47.246Z",
        "__v": 0,
        "isProcessed": true
    },
    "flags": {
        "list": true
    },
    "status": null,
    "error": null
}
~~~~


**Get emails sent to a person**

GET http://localhost:3000/api/emails?to=emailto

Response Sample

~~~~
{
    "data": [
        {
            "to": [
                "emailto@gmail.com"
            ],
            "cc": [],
            "bcc": [],
            "attachment": [],
            "attachmentFileName": [],
            "isBounced": false,
            "_id": "5bdda9994a8880ddf4fad26e",
            "from": "nadia@itpx.one",
            "subject": "update title",
            "text": "update message",
            "html": "<html><head></head><body>update message</body></html>",
            "createdAt": "2018-11-03T13:58:49.748Z",
            "updatedAt": "2018-11-03T13:58:51.876Z",
            "__v": 0,
            "isProcessed": true
        },
        {
            "to": [
                "emailto@gmail.com"
            ],
            "cc": [],
            "bcc": [],
            "attachment": [],
            "attachmentFileName": [],
            "isBounced": false,
            "_id": "5bdda9594a8880ddf4fad26d",
            "from": "nadia@itpx.one",
            "subject": "update title",
            "text": "update message",
            "html": "<html><head></head><body>update message</body></html>",
            "createdAt": "2018-11-03T13:57:45.135Z",
            "updatedAt": "2018-11-03T13:57:47.246Z",
            "__v": 0,
            "isProcessed": true
        },
        {
            "to": [
                "emailto@gmail.com"
            ],
            "cc": [],
            "bcc": [],
            "attachment": [],
            "attachmentFileName": [],
            "isBounced": false,
            "_id": "5bdda9434a8880ddf4fad26c",
            "from": "nadia.fernandess@gmail.com",
            "subject": "update title",
            "text": "update message",
            "html": "<html><head></head><body>update message</body></html>",
            "createdAt": "2018-11-03T13:57:23.335Z",
            "updatedAt": "2018-11-03T13:57:23.335Z",
            "__v": 0
        }
    ],
    "flags": {
        "list": true,
        "size": 3
    },
    "status": null,
    "error": null
}
~~~~