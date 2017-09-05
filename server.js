const express = require('express');
const Node = require('./treeNode');
const app = express();
const _ = require('lodash');
const fs = require('fs');
const consoleArguments = require('optimist').argv;

const exphbs = require('express-handlebars');

let serverPort = consoleArguments.p || 2999;
let filePath = consoleArguments._[0];

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

const getNodeViewForContentFile = (contentFile) => {

    // Reference to rootNode for printing and verifying.
    let rootNode = null;
    // Stack with all beginner nodes.
    let nodeStack = [];
    let currentLevel = 0;
    let xFound = false;
    //console.log(contentFile.length);
    _.forEach(contentFile, (cL) => {
        let trailingTabs = 0;

        while (cL.startsWith('\t')) {
            cL = cL.substring(1);
            trailingTabs++;
        }

        let newNode = new Node();
        newNode.nodeStatus = xFound ? Node.NodeStatus.NotFinished : Node.NodeStatus.Finished;

        if (cL.startsWith('x ')) {
            cL = cL.substring(2);
            newNode.nodeStatus = Node.NodeStatus.Pending;
            xFound = true;
        }

        newNode.nodeContent = cL;

        if (!nodeStack.length) {
            // No Nodes
            if (trailingTabs) {
                throw new Error('Invalid Tabbing.')
            }

            rootNode = newNode;
            rootNode.nodeContent = cL;
            nodeStack.push(rootNode);

        } else {
            // Nodes found


            if (currentLevel + 1 === trailingTabs) {
                let parentNode = nodeStack.pop();

                newNode.parentNode = parentNode;
                parentNode.childNode = newNode;
                newNode.nodeContent = cL;

                nodeStack.push(parentNode, newNode);
                currentLevel++;

            } else if (currentLevel === trailingTabs) {

                let appendNode = nodeStack.pop();

                appendNode.nextNode = newNode;
                newNode.prevNode = appendNode;
                newNode.nodeContent = cL;

                nodeStack.push(appendNode, newNode);

            } else if (currentLevel > trailingTabs) {

                for (let c = 0; c < (currentLevel - trailingTabs); c++) {

                    let popNode = nodeStack.pop();
                    while (!popNode.parentNode) {
                        popNode = nodeStack.pop();
                    }

                }

                let connectNode = nodeStack.pop();

                connectNode.nextNode = newNode;
                newNode.prevNode = connectNode;

                newNode.nodeContent = cL;

                nodeStack.push(connectNode, newNode)
                currentLevel--;
            } else {
                throw new Error('Bad Formatting.', cL);
            }

        }
    });

    return rootNode;
};

let getRootNodeFromFile = (fileName) => {
    let contentFile = fs.readFileSync(fileName).toString().split('\n');
    let rootNode = getNodeViewForContentFile(contentFile);

    return rootNode;
};

app.get('/', (req, res, next) => {

    let rootNode = getRootNodeFromFile(filePath);

    console.log(rootNode);
    res.render('listView', {listView: rootNode.getListView(), serverPort: serverPort});
});

app.get('/list', (req, res, next) => {
    let rootNode = getRootNodeFromFile(filePath);
    res.send(rootNode.getListView());
});


app.listen(serverPort, (data) => {
    console.log('Server started.', serverPort, filePath);
});