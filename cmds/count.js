const shell = require('shelljs')
const path = require('path')
const yaml = require('js-yaml')
const combineFiles = require('../lib/combineFiles.js')

module.exports = (args) => {
  const [cmd, config_file] = args._
  const { target = 'default', output, freq } = args

  if (!config_file) return console.error("Book YAML not specified.")

  const target_path = path.resolve(config_file)
  const source_dir = path.dirname(target_path)

  /** @type {Config} */
  let config = yaml.load(shell.cat(target_path).toString())

  if (!!target && target in config) {
    config = Object.assign(config, config[target])
  }

  console.log(`Scanning "${config.title}"...`)

  const source_files = config.input.flatMap((/** @type {string} */filepath) => {
    if (filepath.includes("*"))
      return Array.from(shell.ls(path.resolve(source_dir, filepath)))
    else return [path.resolve(source_dir, filepath)]
  })

  const formatter = new Intl.NumberFormat()
  const combined_sources = combineFiles(source_files, { silent: true })

  let all_clean_source = ""
  let total_count = 0
  let counts = []
  combined_sources.sources.forEach(f => {
    let count = countWords(f.cleaned.content)
    total_count += count
    all_clean_source += `\n\n${f.cleaned.content}`
    counts.push([f.filename, formatter.format(count)])
  })

  counts.push(["------", "----"])
  counts.push(["Total", formatter.format(total_count)])

  console.log(printTuples(counts))

  if (freq) {
    console.log("\n\nWord Frequency:")
    console.log(printTuples(wordFrequency(all_clean_source)))
  }
}








function cleanString(str) {
  return str.replace(/[^\w\s]|_/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function extractSubstr(str, regexp) {
  return cleanString(str).match(regexp) || [];
}

function getWordsByNonWhiteSpace(str) {
  return extractSubstr(str, /\S+/g);
}

function getWordsByWordBoundaries(str) {
  return extractSubstr(str, /\b[a-z\d]+\b/g);
}

function wordMap(str) {
  return getWordsByWordBoundaries(str).reduce(function (map, word) {
    map[word] = (map[word] || 0) + 1;
    return map;
  }, {});
}

function mapToTuples(map) {
  return Object.keys(map).map(function (key) {
    return [key, map[key]];
  });
}

function mapToSortedTuples(map, sortFn, sortOrder) {
  return mapToTuples(map).sort(function (a, b) {
    return sortFn.call(undefined, a, b, sortOrder);
  });
}

function countWords(str) {
  return getWordsByWordBoundaries(str).length;
}

function wordFrequency(str) {
  return mapToSortedTuples(wordMap(str), function (a, b, order) {
    if (b[1] > a[1]) {
      return order[1] * -1;
    } else if (a[1] > b[1]) {
      return order[1] * 1;
    } else {
      return order[0] * (a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0));
    }
  }, [1, -1]);
}






function printTuples(tuples) {
  return tuples.map(function (tuple) {
    return padStr(tuple[0], ' ', 12, 1) + '  ' + tuple[1];
  }).join('\n');
}

function padStr(str, ch, width, dir) {
  return (width <= str.length ? str : padStr(dir < 0 ? ch + str : str + ch, ch, width, dir)).substr(0, width);
}
