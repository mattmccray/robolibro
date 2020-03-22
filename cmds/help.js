const shell = require('shelljs')

module.exports = (args) => {
  const pandoc_is_missing = !shell.which('pandoc')
  const pandoc_msg = pandoc_is_missing
    ? '(Requires pandoc installation)'
    : ''

  console.log(`
    Usage:
      robolibro [build|count|help|init|version] path/to/book.yaml
        ${pandoc_msg}
        --output <filename.yaml>    Overrides book.yaml output
        --target <name>             Specify nested target in book.yaml
  `)
}