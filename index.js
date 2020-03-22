const minimist = require('minimist')

module.exports = () => {
  // console.log('Welcome to robolibro!')

  const args = minimist(process.argv.slice(2))
  let cmd = args._[0] || 'help'

  if (args.version || args.v) {
    cmd = 'version'
  }

  if (args.help || args.h) {
    cmd = 'help'
  }

  switch (cmd) {

    case 'help':
      require('./cmds/help.js')(args)
      break


    case 'version':
      require('./cmds/version.js')(args)
      break

    case 'count':
      require('./cmds/count.js')(args)
      break

    case 'build':
      require('./cmds/build.js')(args)
      break

    case 'init':
      require('./cmds/init.js')(args)
      break

    default:
      // console.log(args)
      console.error(`"${cmd}" is not a valid command!`)
      break
  }

}