import NestedMap from './nestedmap';
import Router from './router';

export default class Publisher {
    constructor(keySpec) {
        this.keySpec = keySpec;
        this.router = new Router();
    }
    register(path, keyObj, value) {
        let m = this.router.getPattern(path);
        if (m === undefined) {
            m = new NestedMap(this.keySpec);
            this.router.addPattern(path, m);
        }
        m.set(keyObj, value);
    }
    resolve(path, request) {
        // first get NestedMap based on path
        let {value, stack, variables} = this.router.resolve(path);
        if (value === null) {
            return null;
        }
        // determine view name we want and put on request
        let viewName;
        if (stack.length === 0) {
            viewName = '';
        } else if (stack.length === 1) {
            viewName = stack[0];
        } else {
            return null;
        }
        request.viewName = viewName;
        // now construct keyObj
        let keyObj = {};
        for (let keySpec of this.keySpec) {
            let extract = keySpec.extract;
            if (extract === undefined) {
                extract = (request) => request[keySpec.name];
            }
            keyObj[keySpec.name] = extract(request);
        }
        // see whether anything matches view predicates
        let result = value.get(keyObj);
        if (result === undefined) {
            return null;
        }
        // if so, call it with variables and request
        return result(variables, request);
    }
}
