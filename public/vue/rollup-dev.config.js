import vue from 'rollup-plugin-vue';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import buble from 'rollup-plugin-buble';
import postcss from 'rollup-plugin-postcss';
import livereload from 'rollup-plugin-livereload';

import autoprefixer from 'autoprefixer';
import sass from 'node-sass';

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
        vue({
            styleToImports: true, 
            scss: {
                outputStyle: 'expanded',
            }
        }),
        postcss({
            preprocessor: (content, id) => new Promise((resolve, reject) => {
                if(!/\.scss$/.test(id)) return resolve({ code : content });
                sass.render({ data: content, outputStyle: 'expanded', }, (err, result) => {
                    if (err) return reject(err);
                    resolve({ code: result.css.toString() })
                });
            }),
            plugins: [autoprefixer()],
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
        livereload()
    ]
};