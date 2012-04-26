
    var config = module.exports;

    config["DOBSelect"] = {
        rootPath: "../",
        environment: "browser",
        libs:[
            "./Demo/lib/mootools.js",
            "./Demo/lib/mootools-more-1.4.0.1.js"
        ],
        sources: [
            "DOBSelect.js",
            "DOBSelect.Inject.js"
        ],
        tests: [
            "tests/DOBSelect-test.js",
            "tests/DOBSelect.Inject-test.js"
        ]
    };
