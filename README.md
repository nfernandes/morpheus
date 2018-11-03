Mercury - email notification service
=================================

DEVELOPMENT ENVIRONMENT SETUP
----------------------------------------------

Here you will find the instructions to setup the development environment for OS X and Linux (Debian Based)

## OS X

**Git :** It comes already preinstalled if you have [Xcode](https://developer.apple.com/xcode/)  . However, the Git that is installed through XCode is a fairly older version. You can install the latest version of Git through the [Git-SCM](http://git-scm.com/download/mac).

**NodeJS  :** The latest stable version of NodeJS can be downloaded from [here](https://nodejs.org/). This installs NodeJS as well as the Node Package Manager (npm). 

`npm install express -g`

`npm install express-generator -g` 

This installs the Express Framework and Express Generator (that creates a skeleton of an Express Application) globally and makes it available globally (the -g flag) so that it can be invoked from the terminal to create other applications.

`npm install bower -g`

This installs a front-end package Manager.

`npm install -g grunt-cli`

This install a task runner, that generates specific files in specific folders of the project.

**MongoDB :**  Install [Homebrew](http://brew.sh/) for OS X and run:

`brew install mongodb`

Then create a data directory:
`sudo mkdir -p /data/db`

And run the following commands:
`sudo mongod`

`mongo` 

If you can log in to the MongoDB console - you are all set.

## Linux (Ubuntu/Mint)

**Git :**  `sudo apt-get install git`.

**NodeJS  :** Ubuntu contains a version of NodeJS in its default repositories (can be installed by running `sudo apt-get install nodejs`), however, it may not be the latest version. You can install the latest stable version of NodeJS by running the following commands:

`curl -sL https://deb.nodesource.com/setup | sudo bash -`

`sudo apt-get install nodejs`

Install Express Framework through NPM - the NodeJS Package Manager


`npm install express -g`

`npm install express-generator -g` 


This installs the Express Framework and Express Generator (that creates a skeleton of an Express Application) globally and makes it available globally (the -g flag) so that it can be invoked from the terminal to create other applications.

`npm install bower -g`


This install a task runner, that generates specific files in specific folders of the project.

You need to install the following libraries to compile certain NodeJs Modules.

`sudo apt-get install build-essential`

`sudo apt-get install libkrb5-dev`

`sudo apt-get install automake libtool`

**MongoDB :**  Run the following commands, in case of issues please refer to MongoDB's homepage.

`sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10`

If using Ubuntu 14.04: 

`echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list`

`sudo apt-get update`

`sudo apt-get install -y mongodb-org`

Check if MongoDB is working fine:

`service mongod status`

You should see a response similar to this:

`mongod start/running, process 1086`

That indicates that everything has been installed successfully and MongoDB is up and running. If you do not see that, start MongoDB by issuing the following command

`sudo service mongod start`

You can enter the MongoDB console simply by calling:

`mongo` 


## Windows

**Git :**  Install git [Command Line](https://git-scm.com/download/win) and optionally [Tortoise](https://tortoisegit.org/download) if you want a GUI. There are also alternatives

**NodeJS  :** The latest stable version of NodeJS can be downloaded from [here](https://nodejs.org/). This installs NodeJS as well as the Node Package Manager (npm). 

`npm install express -g`

`npm install express-generator -g` 

This installs the Express Framework and Express Generator (that creates a skeleton of an Express Application) globally and makes it available globally (the -g flag) so that it can be invoked from the terminal to create other applications.

`npm install bower -g`

This installs a front-end package Manager.

`npm install -g grunt-cli`

This install a task runner, that generates specific files in specific folders of the project.

**MongoDB :**  Install MongoDB community edition from [here](http://brew.sh/)

Then create following directories:

`C:\data\db`  
`C:\data\log`

and create a file named `mongod.cfg` under `%programfiles%\MongoDB\Server\3.2\bin` with following content

```
systemLog:
    destination: file    
    path: c:\data\log\mongod.log
storage:
    dbPath: c:\data\db
```

and run the following commands:  
`%programfiles%\MongoDB\Server\3.2\bin\mongod.exe --config %programfiles%\MongoDB\Server\3.2\bin\mongod.cfg --install`  
`net start MongoDB`  
`%programfiles%\MongoDB\Server\3.2\bin\mongo.exe` 

If you can log in to the MongoDB console - you are all set.

SETUP
---------------

Create a directory `mercury` and run the following command:

`git clone https://itpx.githost.io/amber/mercury.git`

`npm install`

`npm start mailer` - run without email server 

`npm start` - run with email server 

Mercury should be up and running on `http://localhost:3004`


Project structure
---------------

- backend which contains all the functionality

    - config with the env variables for each environment

    - controllers: apis for emails, general templates (no email templates), templates (email templates) and version

    - middleware: authentication and authorization 

    - routes: for the controllers (same names)

    - utils

        - resultsFormatter: return the necessary fields, makes some transformations on the results

        - response: put the data in the right format to be sent {data: {}, etc etc}

        - templateLibrary: replace the placeholders in the templates with the right data, there is a version to  advanced (handerlbars) and for standard templates (with %placeholder%). If is necessary is in this file that new helpers for handelbars have to be added 

        - logger: connect with graylog to save the logs

        - notificationPreferencesExecutor: based on user notification preferences decide if an email or notification should be sent

        - notificationSender: sends the notification in a proper format (platform notification or email), based on results of notificationPreferencesExecutor 

        (emails/notifications are now send synchronously, and the response informs about the error or gives the email or notification id in case of success)

    - process

        - server



TODO
---------------

- validate of handelbars on create
- send notification preferences computed per user to frontend 
- improve check notification per types
- generate "object" using and algorithm for several type of notifications