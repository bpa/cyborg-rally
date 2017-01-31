var HtmlWebpackPlugin = require('html-webpack-plugin'),
    CopyWebpackPlugin = require("copy-webpack-plugin"),
    webpack = require("webpack"),
    path = require("path"),
    glob = require("glob"),
    copy = ['react/dist',
            'react-dom/dist'].map(function(d) {
        return glob.sync("node_modules/"+d+"/**/*.*");
    }).reduce(function(a,b){
        return a.concat(b)
    }).map(function(f) {
        var to = /(?:dist|bin)[/\\](([^/\\]+).*?\.([^.]+)(?:.map)?)$/.exec(f);
        var file = to[1];
        if (to[2] !== 'fonts' && to[2] !== to[3]) {
            file = path.join(to[3], file);
        }
        return {
            from: __dirname + '/' + f,
			to: file
        }
    });

module.exports = {
    entry: './js/Client.js',
    output: {
        filename: "cyborg-rally.js",
        path: './public',
    },
	resolve: {
		extensions: ['', '.js', '.scss', '.css']
	},
	externals: {
		'react': 'React',
		'react-dom': 'ReactDOM'
	},
	devtool: 'source-map',
    module: {
        loaders: [
            {   test: /\.jsx?$/,
                loader: 'babel',
                includes: ['./js'],
                query: {
                    presets: ['es2015', 'react'],
                    plugins: [
                        'transform-class-properties',
                        ['transform-runtime', {
                            "helpers": false,
                            "polyfill": false,
                        }],
                    ],
                }
            },
        ]

    },
    plugins: [
        new HtmlWebpackPlugin({
            hash: true,
            template: './index.tpl.html'
        }),
		new CopyWebpackPlugin(copy),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            output: {
                comments: false,
            },
        }),
    ]
}
