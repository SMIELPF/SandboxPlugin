class SandBoxPlugin {
    constructor(options = {chunks: 'all'}) {
        this.chunkNames = options.chunks;
        this.sandBoxId = null;
    }

    getCodeWrappedInSandBox(code) {
        return `\
if (!window.${this.sandBoxId}) {
    window.${this.sandBoxId} = {};
    window.${this.sandBoxId}_proxy = new Proxy(window, {
        get(target, key) {
            if (key === '__REAL_WINDOW__') {
                return target;
            }
            if (key in target.${this.sandBoxId}) {
                return target.${this.sandBoxId}[key];
            } else {
                return (typeof target[key] === 'function' ? target[key].bind(target) : target[key]);
            }
        },
        set(target, key, value) {
            target.${this.sandBoxId}[key] = value;
            return true;
        }
    });
}
(function(window) {
    ${code}
}).call(window.${this.sandBoxId}_proxy, window.${this.sandBoxId}_proxy);
`;
    }

    updateChunk(compilation, chunk) {
        const jsFiles = chunk.files.filter((fileName) => {
            const jsReg = /\.js$/;
            return jsReg.test(fileName);
        });

        console.log(jsFiles);

        jsFiles.forEach((fileName) => {
            const codeWitoutSandBox = compilation.assets[fileName].source();
            compilation.assets[fileName] = {
                source: () => {
                    return this.getCodeWrappedInSandBox(codeWitoutSandBox);
                },
                size: () => {
                    return this.getCodeWrappedInSandBox(codeWitoutSandBox).length;
                }
            };
        });
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync('SandBoxPlugin', (compilation, callback) => {
            // validate type of options.chunks
            if (!Array.isArray(this.chunkNames) && !this.chunkNames === 'all') {
                throw new Error(`[SandBoxPlugin] chunks should be an array or 'all' but received a ${typeof this.chunks}`);
            }

            // filter chunks
            if (this.chunkNames === 'all') {
                this.chunks = compilation.chunks;
            } else {
                this.chunks = compilation.chunks
                    .filter((chunk) => {
                        return this.chunkNames.includes(chunk.name);
                    });
            }
            // set sandBoxId by chunk[0]'s hash
            const hash = compilation.chunks[0].hash;
            this.sandBoxId = `sandbox_${hash}`;

            this.chunks.forEach((chunk) => {
                this.updateChunk(compilation, chunk);
            });
            callback();
        });
    }
};

module.exports = SandBoxPlugin;
