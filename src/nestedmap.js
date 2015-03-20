
export default class NestedMap {
    constructor(keySpec) {
        this.keySpec = keySpec;
        this.map = new Map();
    }
    normalizeKey(keyObj) {
        let result = [];
        for (let keySpec of this.keySpec) {
            let key = keyObj[keySpec.name];
            if (key === undefined) {
                key = keySpec.defaultKey;
            }
            result.push(key);
        };
        return result;
    };
    set(keyObj, value) {
        let normalizedKey = this.normalizeKey(keyObj);
        let m = this.map;
        for (let key of normalizedKey.slice(0, -1)) {
            let sub = m.get(key);
            if (sub === undefined) {
                sub = new Map();
                m.set(key, sub);
            }
            m = sub;
        }
        m.set(normalizedKey[normalizedKey.length - 1], value);
    }
    get(keyObj) {
        let normalizedKey = this.normalizeKey(keyObj);
        let m = this.map;
        let depth = 0;
        for (let key of normalizedKey) {
            m = m.get(key);
            if (m === undefined) {
                return this.keySpec[depth].fallback;
            }
            depth++;
        }
        return m;
    }
};
