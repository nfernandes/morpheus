Morpheus - notification service, sending update emails
=================================

"Morpheus, the Greek God of Dreams who delivered messages from the gods to the mortal world"


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

### Configurations

Environment configurations allowing to use specific variables depending on the project environment at the time.
In AWS we would set up the correct node.process.env indicating which env file to use (i would have one for test, stage, prod).
In this case i am allowing my dev config file to be public. In a real project the repository would be private or i would not commit the env files. 

### Controllers

Contain the api functionalities for the routes defined. I added functionality to send emails/text message. However, i only activated send emails.

### Middleware

Middleware with authentication (checking if authentication is valid). In this case we can for instance use Json Web Token, because this updates could be use between systems so would be a secure and easy way to make authentication between systems.

### Modules

Mongodb modules used, in this case emails. The email module is already prepared to do pagination to have attachment etc. 

### Routes

The api paths defined for the project. 

### Utils

Extra functionalities that we can use as helpers for the controllers and that can be use in several controllers. 
This way, the funcionality is keep modular and the code becomes clean and simple.

- __reponse__: Creating a standardized template for responses. To guarantee that it is always sent the same type of structure in the response. Allows easier collaboration with other systems. 

- __sender__: Email/SMS sender functionality based on nodemailer/puretext respectively. Nodemailer was selected because it is a reliable service easy to use and to set up. A gmail test account was setup to send the emails. Consequently, the from email used by default is the created gmail. However, if we would have a mailchimp or AWS SMTP or other the from email could be configurable. In the sending functionality, promised were use to keep synchronism in the response to a client system or the user directly. 

- __validator__: Some functionalities using some pre-existent js validations and adding extra ones necessaries in the project context. 


Possible improvements
---------------
- possible to create email templates, those case be made using handelbars with placeholders to allow easy usage of them. this would make easier to send updates (standard messages)

- Using AWS Lambda to run every X amount of time (for instance 1 minute) to check if there is any email that was not processed in case of error for instance. and retry to send it. 

Sample of usage
----------------


### Create update message

Design of request is using 'notifications', because can be use for emails or/and sms. I also used the version, because v1 is the original request and v2 will have an example of authentication.

#### 1. v1

`POST http://localhost:3000/api/v1/notifications`

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
        "from": "emailfrom@gmail.one",
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

#### 2. v2

`POST http://localhost:3000/api/v2/notifications`

BODY:
same has above

**NO AUTHORIZATION HEADERS**

Response Sample

~~~~
{
    "status": 401,
    "error": "Unauthenticated"
}
~~~~


**WITH AUTHORIZATION HEADERS**

Example header:
JWT created with the secret in env file.

~~~~
Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjU4MTg1NmM2NTc0MDYwNDQwNTAzMzQ3YyIsImlhdCI6MTU0MTMyNTEzMSwiZXhwIjoxNTQxNDExNTMyfQ.V5qhmq11rOZMXoa8G8j-z8VXUAhkUzVWSIYYrgEccn4
~~~~


Response Sample:
~~~~
Same response that we have for v1.
~~~~

### Get emails sent to a person

Design of request is using 'notifications' and 'to' in the query to obtain a specific user email, could also have done with name.
I also used the version, because v1 is the original request and v2 will have an example of authentication.

#### 1. v1

`GET http://localhost:3000/api/v1/notifications?to=emailto`

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
            "from": "emailfrom@gmail.one",
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
            "from": "emailfrom@gmail.one",
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

#### 2. v2

`GET http://localhost:3000/api/v2/notifications?to=emailto`

BODY:
same has above

**NO AUTHORIZATION HEADERS**

Response Sample

~~~~
{
    "status": 401,
    "error": "Unauthenticated"
}
~~~~


**WITH AUTHORIZATION HEADERS**

Example header:
JWT created with the secret in env file.

~~~~
Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjU4MTg1NmM2NTc0MDYwNDQwNTAzMzQ3YyIsImlhdCI6MTU0MTMyNTEzMSwiZXhwIjoxNTQxNDExNTMyfQ.V5qhmq11rOZMXoa8G8j-z8VXUAhkUzVWSIYYrgEccn4
~~~~


Response Sample:
~~~~
Same response that we have for v1.
~~~~

