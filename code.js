console.log("Start PrepToMigrate");
const timers = {
    _timers: {},
    start: (name) => {
        const now = Date.now();
        timers._timers[name] = now;
    },
    end: (name) => {
        if (!timers._timers[name]) {
            console.error("No such timer");
            return 0;
        }
        else {
            const now = Date.now();
            const ellapsed = now - timers._timers[name];
            console.log(`${name}: ${ellapsed}ms`);
        }
    }
};
timers.start("main");
timers.start("indexing components");
const instanceCounts = new Map;
const componentSetComponents = new Map;
const freestandingComponents = [];
figma.currentPage.findAllWithCriteria({
    types: ['COMPONENT']
}).forEach(n => {
    instanceCounts.set(n, 0);
    if (n.parent.type === "COMPONENT_SET") {
        if (!componentSetComponents.has(n.parent))
            componentSetComponents.set(n.parent, []);
        componentSetComponents.get(n.parent).push(n);
    }
    else {
        freestandingComponents.push(n);
    }
});
timers.end("indexing components");
timers.start("counts");
console.log("Starting counts");
function countComponentChildren(node) {
    function countChildrenRecursive(toCount) {
        if ("children" in toCount)
            toCount.children.forEach(c => {
                if (c.type === "INSTANCE")
                    instanceCounts.set(node, instanceCounts.get(node) + 1);
                countChildrenRecursive(c);
            });
    }
    countChildrenRecursive(node);
}
const toCount = instanceCounts.keys();
function countNext() {
    const { value, done } = toCount.next();
    if (!done) {
        const countWhat = value;
        countComponentChildren(countWhat);
        console.log(`Done counting instances in ${countWhat.name}, onto next in 5ms`);
        setTimeout(countNext, 5);
    }
    else {
        console.log(instanceCounts);
        console.log(componentSetComponents);
        console.log(freestandingComponents);
        allDone();
    }
}
countNext();
function allDone() {
    timers.start("counts");
    timers.end("main");
    console.log("PrepToMigrate Done");
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
}
