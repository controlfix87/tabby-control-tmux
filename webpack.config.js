const path = require('path')
module.exports = {
  target: 'node',
  entry: './src/index.ts',
  output: { path: path.resolve(__dirname, 'dist'), filename: 'index.js', libraryTarget: 'umd' },
  resolve: { extensions: ['.ts', '.js'] },
  module: { rules: [{ test: /\.ts$/, loader: 'ts-loader', options: { transpileOnly: true } }] },
  externals: ['fs', 'os', 'path', /^@angular\//, /^rxjs/, /^tabby-/, /^@ng-bootstrap/, /^russh/],
}
