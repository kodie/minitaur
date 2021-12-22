import { babel } from '@rollup/plugin-babel'

const config = {
  input: 'src/minitaur.js',
  output: {
    dir: 'dist',
    format: 'umd',
    name: 'minitaur',
    sourcemap: true
  },
  plugins: [
    babel({ babelHelpers: 'bundled' })
  ]
}

export default config
