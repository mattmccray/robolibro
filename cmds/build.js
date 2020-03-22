const shell = require('shelljs')
const path = require('path')
const yaml = require('js-yaml')
const combineFiles = require('../lib/combineFiles.js')

module.exports = (args) => {
  const pandoc_is_missing = !shell.which('pandoc')
  const [cmd, config_file] = args._
  const { target = 'default', output } = args

  if (pandoc_is_missing) return console.error("You must install `pandoc` to build a docx file.")
  if (!config_file) return console.error("Book YAML not specified.")

  const target_path = path.resolve(config_file)
  const source_dir = path.dirname(target_path)

  /** @type {Config} */
  let config = yaml.load(shell.cat(target_path).toString())

  if (!!target && target in config) {
    config = Object.assign(config, config[target])
  }

  const output_file = !!output
    ? path.resolve(output)
    : path.resolve(source_dir, config.output)
  const output_dir = path.dirname(output_file)

  console.log(`Assembling "${config.title}"...`)

  const source_files = config.input.flatMap((/** @type {string} */filepath) => {
    if (filepath.includes("*"))
      return Array.from(shell.ls(path.resolve(source_dir, filepath)))
    else return [path.resolve(source_dir, filepath)]
  })

  const combined_sources = combineFiles(source_files)
  const combined_content = finalizeMarkdown(combined_sources.content, config)
  const template_path = path.resolve(__dirname, '../', 'templates', 'manuscript.docx')
  const markdown_file = output_file.replace(path.extname(output_file), '.md')

  shell.mkdir('-p', output_dir)

  shell.ShellString(combined_content).to(markdown_file)

  if (config.cleanup !== true)
    console.log(" >", markdown_file)

  shell.exec(`pandoc "${markdown_file}" -o "${output_file}" --reference-doc ${template_path}`)
  console.log(`\nBuilt ${output_file}`)

  if (config.cleanup == true)
    shell.rm(markdown_file)
}


/**
 * @typedef {{
 *  title: string,
 *  subtitle?: string,
 *  author?: string,
 *  version?: string,
 *  published?: string,
 *  create_titlepage?: boolean,
 *  cleanup?: boolean,
 *  input: string[],
 *  output: string
 * }} Config
 */

/**
 * 
 * @param {string} source 
 * @param {Config} config 
 */
function finalizeMarkdown(source, config) {
  if (config.create_titlepage !== true) return source

  return `---
title: ${config.title.toUpperCase()}
author: by ${config.author}
---

${source}

The End`
}