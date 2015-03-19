const IDENTIFIER = /^[^\d\W]\w*$/;
const PATH_VARIABLE = /\{([^}]*)\}/g;
const VARIABLE = '{}';
const PATH_SEPARATOR = /\/+/;

export default class Router {
    constructor() {
        this.root = new Node();
    }
    addPattern(path, value) {
        let node = this.root;
        let knownVariables = new Set();
        for (let segment of parsePath(path)) {
            let step = new Step(segment);
            node = node.add(step);
            // XXX duplicate variables check
        }
        node.value = value;
    }
    consume(stack) {
        stack = stack.slice();
        let node = this.root;
        let variables = {};
        while (stack.length > 0) {
            let segment = stack.pop();
            let found = node.get(segment);
            if (found.node === null) {
                stack.push(segment);
                return {
                    value: node.value,
                    stack: stack,
                    variables: variables
                };
            }
            node = found.node;
            Object.assign(variables, found.variables);
        }
        return {
            value: node.value,
            stack: stack,
            variables: variables
        };
    }
    resolve(path) {
        let steps = parsePath(path);
        steps.reverse();
        return this.consume(steps);
    }
};

class Step {
    constructor(s) {
        this.s = s;
        this.generalized = generalizeVariables(s);
        this.variablesRe = createVariablesRe(s);
        this.names = parseVariables(s);
        this.parts = this.generalized.split('{}');
    }
    match(s) {
        let matched = this.variablesRe.exec(s);
        if (matched === null) {
            return {
                matched: false,
                variables: {}
            };
        }
        matched = matched.slice(1);
        let result = {};
        for (let i = 0; i < this.names.length; i++) {
            result[this.names[i]] = matched[i];
        }
        return {
            matched: true,
            variables: result
        };
    }
    hasVariables() {
        return this.names.length > 0;
    }
    greaterThan(other) {
        if (isSame(this.parts, other.parts)) {
            return false;
        }
        return !this.lesserThan(other);
    }
    lesserThan(other) {
        if (isSame(this.parts, other.parts)) {
            return false;
        }
        if (this.variablesRe.exec(other.s) !== null) {
            return false;
        }
        if (other.variablesRe.exec(this.s) !== null) {
            return true;
        }
        return greaterThan(this.parts, other.parts);
    }
};

class Node {
    constructor() {
        this.nameNodes = new Map();
        this.variableNodes = [];
        this.value = null;
    }
    add(step) {
        if (!step.hasVariables()) {
            return this.addNameNode(step);
        }
        return this.addVariableNode(step);
    }
    addNameNode(step) {
        let node = this.nameNodes.get(step.s);
        if (node !== undefined) {
            return node;
        }
        node = new StepNode(step);
        this.nameNodes.set(step.s, node);
        return node;
    }
    addVariableNode(step) {
        for (let i = 0; i < this.variableNodes.length; i++) {
            let node = this.variableNodes[i];
            if (node.step === step) {
                return node;
            }
            if (node.step.generalized === step.generalized) {
                // raise new Error(
                //     `step ${node.step.s} and ${step.s} are in conflict`);
            }
            if (step.greaterThan(node.step)) {
                continue;
            }
            let result = new StepNode(step);
            this.variableNodes.splice(i, 0, result);
            return result;
        }
        let result = new StepNode(step);
        this.variableNodes.push(result);
        return result;
    }
    get(segment) {
        let node = this.nameNodes.get(segment);
        if (node !== undefined) {
            return { node: node, variables: {} };
        }
        for (let node of this.variableNodes) {
            let matched = node.match(segment);
            if (matched.matched) {
                return { node: node, variables: matched.variables };
            }
        }
        return { node: null, variables: {} };
    }
}

class StepNode extends Node {
    constructor(step) {
        super();
        this.step = step;
    }
    match(segment) {
        return this.step.match(segment);
    }
}

function parsePath(path) {
    if (path.startsWith('/')) {
        path = path.slice(1);
    }
    if (path.endsWith('/')) {
        path = path.slice(0, -1);
    }
    return path.split(PATH_SEPARATOR)
}

function generalizeVariables(s) {
    return s.replace(PATH_VARIABLE, '{}');
}

function createVariablesRe(s) {
    return new RegExp('^' + s.replace(PATH_VARIABLE, '(.+)') + '$');
};

function parseVariables(s) {
    let result = PATH_VARIABLE.exec(s);
    if (result === null) {
        return [];
    }
    return result.slice(1);
};

function isSame(one, two) {
    if (one.length !== two.length) {
        return false;
    }
    for (let i = 0; i < one.length; i++) {
        if (one[i] !== two[i]) {
            return false;
        }
    }
    return true;
};

function greaterThan(one, two) {
    for (let i = 0; i < one.length; i++) {
        if (i > two.length) {
            return true;
        }
        if (one[i] > two[i]) {
            return true;
        }
    }
    return false;
};
