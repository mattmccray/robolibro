const { cat, ShellString, ls, mkdir, exec } = require('shelljs')
const { join, resolve, basename } = require('path')
const matter = require('gray-matter')
const removeComments = require('./removeHtmlComments.js')


/**
 * Returns the content of a single
 * @param {string[]} filelist 
 * @param {{ silent?: boolean }} options
 * @returns {{ metadata: any, sources: Source[], content: string }} -- returns object with merged meta data and content
 */
function combineFiles(filelist, options = {}) {

  // - Cat all the *.md files from book folder into a single file
  let sources = filelist.map((fullpath, i) => {
    const source = cat(fullpath).trim()
    const parsed = matter(source)

    if (!options.silent) console.log(` - ${fullpath}`)

    return {
      fullpath,
      filename: basename(fullpath),
      index: i,
      order: i + 10,
      metadata: parsed.data,
      source: source,
      cleaned: removeComments(parsed.content),
      contents: parsed.content
    }
  })

  sources = sources.sort((a, b) => {
    const aO = a.metadata.order || a.order
    const bO = b.metadata.order || b.order
    return aO - bO
  })

  const metadata = sources.reduce((data, file) => {
    // Extract any internal keys from metadata...
    const { order, chapter, only_for_template, ...otherMetadata } = file.metadata
    return Object.assign(data, otherMetadata)
  }, {})


  const content = sources.reduce((content, file, i) => {
    content += extractContentFromSource(file)
    return content
  }, '').trim()

  return {
    metadata, // Merged
    sources,
    content
  }
}

module.exports = combineFiles
module.exports.combineFiles = combineFiles


/**
 * @typedef {{
      fullpath: string,
      filename: string,
      index: number,
      order: number,
      metadata: any,
      cleaned: {
        content: string,
        comments: string[]
      },
      source: string,
      contents: string
    }} Source
 */

/**
 * 
 * @param {Source} file 
 */
function extractContentFromSource(file) {
  let source = ''

  // - At the top of each file add `# Chapter {N}`
  if (file.metadata.chapter !== false)
    source += `# Chapter ${file.index + 1}\n\n`

  source += file.contents
    // - Replace lines that consist of `* * *` or `---` with `### * * *`
    .replace(/^\* \* \*$/gm, "### * * *")
    .replace(/^---$/gm, "### * * *")
    // - Fix quote within quotes (chicago manual of style)
    .replace(/' "/gm, "'&nbsp;\"")
    .replace(/'"/gm, "'&nbsp;\"")
    .replace(/" '/gm, "\"&nbsp;'")
    .replace(/"'/gm, "\"&nbsp;'")

  return source + '\n\n'
}