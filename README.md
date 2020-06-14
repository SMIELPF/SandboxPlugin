# SandboxPlugin
a webpack plugin to wrap your code in sandbox

## Usage

```javaScript
// webpack config
module.exports = {
    entry: {
        main: './index.js',
        vendor: 'node_modules',
    }
    plugins: [
        new SandBoxPlugin({
            chunks: ['main']
        })
    ]
}
```
or
```javaScript
// webpack config
module.exports = {
    entry: {
        main: './index.js',
        vendor: 'node_modules',
    }
    plugins: [
        new SandBoxPlugin({
            chunks: 'all'
        })
    ]
}
```