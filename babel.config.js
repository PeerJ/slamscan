module.exports = (api) => {
    let presets = [
        [
            "@babel/preset-env",
            {
                targets: {
                    node: "current"
                },
                useBuiltIns: "entry"
            }
        ]
    ];

    let plugins = [
        "lodash",
        ["@babel/plugin-proposal-class-properties", {loose: true}],
        "@babel/plugin-proposal-object-rest-spread",
        "@babel/plugin-transform-property-literals"
    ];

    switch (api.env()) {
        case "test": {
            plugins.push("istanbul");
            break;
        }

        case "server": {
            presets = [
                [
                    "@babel/preset-env",
                    {
                        targets: {
                            node: "current"
                        },
                        useBuiltIns: "entry"
                    }
                ]
            ];
            break;
        }
    }

    return {
        plugins,
        presets
    };
};
