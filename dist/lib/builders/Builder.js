"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Builder = void 0;
class Builder {
    text = '';
    append(text) {
        this.text += text;
        return this;
    }
    doubleLine() {
        this.text += '\n\n';
        return this;
    }
    line() {
        this.text += '\n';
        return this;
    }
    getText() {
        return this.text;
    }
}
exports.Builder = Builder;
