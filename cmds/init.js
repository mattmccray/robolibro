const shell = require('shelljs')
const path = require('path')

module.exports = (args) => {
  const [cmd, config_file] = args._

  if (!config_file) return console.error("Book YAML not specified.")

  const target_path = path.resolve(config_file)
  const source_dir = path.dirname(target_path)

  if (shell.test('-e', target_path)) return console.log("Already exists:", config_file)

  shell.mkdir('-p', source_dir)

  const template = shell.cat(path.resolve(__dirname, '..', 'templates', 'book_template.yaml'))
  shell.ShellString(template).to(target_path)

  console.log(`Created`, target_path)
}