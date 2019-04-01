import vue from 'rollup-plugin-vue';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';
import postcss from 'rollup-plugin-postcss';

import autoprefixer from 'autoprefixer';
import sass from 'node-sass';
import cssnano from 'cssnano';

export default {
    input: 'src/main.js',
    output: {
        file: 'dist/build.js',
        format: 'iife'
    },
    plugins: [
        resolve({
            jsnext: true,
            main: true,
            browser: true
        }),
        vue({ styleToImports: true }),
        postcss({
            preprocessor: (content, id) => new Promise((resolve, reject) => {
                if(!/\.scss$/.test(id)) return resolve({ code : content });
                sass.render({ data: content }, (err, result) => {
                    if (err) return reject(err);
                    resolve({ code: result.css.toString() })
                });
            }),
            plugins: [autoprefixer(), cssnano()],
            sourceMap: true,
            extract: true,
            extensions: ['.scss', '.css']
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'process.env.VUE_ENV': JSON.stringify('browser'),
        }),
        buble({
            exclude: ['node_modules/!(vue/)/**'],
            jsx: 'createElement'
        }),
        uglify()
    ]
};