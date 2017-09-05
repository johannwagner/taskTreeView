const _ = require('lodash');

class Node {
    static NodeStatus() {
        return {
            NotFinished: 1,
            Pending: 2,
            Finished: 3
        };
    }
    constructor() {
        this.parentNode = null;
        this.childNode = null;
        this.prevNode = null;
        this.nextNode = null;
        this.nodeContent = null;
        this.nodeStatus = null;


    }


    checkIntegrity() {
        if (this.parentNode && this.prevNode) {
            return false;
        }

        if(this.childNode && this.nextNode){
            return this.childNode.checkIntegrity() && this.nextNode.checkIntegrity();
        } else if(this.childNode){
            return this.childNode.checkIntegrity();
        } else if(this.nextNode){
            return this.nextNode.checkIntegrity();
        } else {
            return true;
        }

    }

    isPendingItemInChild (firstNode) {
        if (this.nodeStatus === Node.NodeStatus.Pending) {
            return true;
        }

        if (this.childNode && this.nextNode && !firstNode) {
            return this.childNode.isPendingItemInChild() || this.nextNode.isPendingItemInChild();
        } else if (this.childNode) {
            return this.childNode.isPendingItemInChild();
        } else if (this.nextNode && !firstNode) {
            return this.nextNode.isPendingItemInChild();
        } else {
            return false;
        }
    }

    getLastNode() {
        if(!this.nextNode){
            return this;
        }

        return this.nextNode.getLastNode();
    }

    getFirstNode() {
        if(!this.prevNode) {
            return this;
        }

        return this.prevNode.getFirstNode();
    }

    isRootNode () {
        return !this.prevNode && !this.parentNode;
    }

    getListView(){

        let startWrapper = '';
        let endWrapper = '';

        let nodeStatus;

        if(this.nodeStatus === Node.NodeStatus.NotFinished) {
            nodeStatus = 'class="notFinishedItem"'
        }

        if (this.nodeStatus === Node.NodeStatus.Finished) {

            nodeStatus = 'class="finishedItem"'
        }

        if (this.isPendingItemInChild(true)) {
            nodeStatus = 'class="pendingItemNoAnim"'
        }

        if (this.nodeStatus === Node.NodeStatus.Pending) {
            nodeStatus = 'class="pendingItem"'
        }

        //console.log(this.nodeStatus);
        if(this.isRootNode()) {
            startWrapper = '<ul>'
            endWrapper = '</ul>'
        }
        //console.log(this.isPendingItemInChild())
        if(this.childNode && this.isPendingItemInChild(true)) {
            return `
            ${startWrapper}
            <li ${nodeStatus}>
                ${this.nodeContent}
                <ul>
                    ${this.childNode.getListView()}
                </ul>
            </li>
            ${this.nextNode ? this.nextNode.getListView() : ''}
            ${endWrapper}
        `
        }

        return `
            ${startWrapper}
            <li ${nodeStatus}>
                ${this.nodeContent ? this.nodeContent : ''}
            </li>
            ${this.nextNode ? this.nextNode.getListView() : ''}
            ${endWrapper}
        `
    }

}

Node.NodeStatus = {
    NotFinished: 1,
    Pending: 2,
    Finished: 3
};

module.exports = Node;