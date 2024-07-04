# Indexed DB Todo List Application using TypeScript

This is the implementation of todo list application in typescript with the help of indexed DB. All the data of the todo app will store on indexed DB such as text and images.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

You'll need [Git](https://git-scm.com), and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer.

```
node@20.0.0 or higher
npm@10.0.0 or higher
git@2.39.0 or higher
```

## Clone the repo

```shell
git clone https://github.com/AbubakarWebDev/indexed-db-todo-app-typescript
cd indexed-db-todo-app-typescript
```

## Install npm packages

Install the `npm` packages described in the `package.json` and verify that it works:

```shell
npm install
npm run dev
```

## IDB Service

In this project, I have created an IDB service that will be used for getting and setting data from and into IndexedDB.

IDB class is the wrapper on top of the browser API of the indexed DB, and I think it is good enough for normal operation but thier is always room for the imporovements.

So, if anyone one to contribute to make it further improve it do not think more, and start creating a PR for this.

Keep Growing!
