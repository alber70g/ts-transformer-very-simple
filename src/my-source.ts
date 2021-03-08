const variable = "Hello, World!";
function add(...args: any[]) {
    args.reduce((acc, curr) => {
        if (typeof curr === "string") {
            acc += curr.length;
        }
        else if (typeof curr === "number") {
            acc += curr;
        }
        else {
            throw new Error(`I don't know what to do with \`${curr}\` of type \`${typeof curr}\``);
        }
        return curr;
    }, 0);
}
