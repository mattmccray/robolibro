const regex = /<!--([\s\S]*?)-->/g

function removeHtmlComments(content) {
  content = String(content)
  const comments = []

  content = content.replace(regex, (match) => {
    comments.push(match)
    return ''
  })

  return {
    content, comments
  }
}

module.exports = removeHtmlComments
module.exports.removeHtmlComments = removeHtmlComments
