/**
 * Installs a local version of all the rokucommunity dependent packages into this project
 */

var fsExtra = require('fs-extra');
var path = require('path');
var childProcess = require('child_process');
var chalk = require('chalk');

var argv = require('yargs').argv;

let packages = [
  { prefix: 'log', name: 'maestro-roku-log' },
  { prefix: 'mc', name: 'maestro-roku-core' },
  { prefix: 'mioc', name: 'maestro-roku-ioc' },
  { prefix: 'mv', name: 'maestro-roku-view' },
  { prefix: 'mx', name: 'maestro-roku-mvvm' },
];

//set the cwd to the root of this project
let thisProjectRootPath = path.join(__dirname, '..');
process.chdir(thisProjectRootPath);
let packageJson = JSON.parse(fsExtra.readFileSync('package.json').toString());

for (let pkg of packages) {
  printHeader(pkg.name);
  let packageSrcPath = path.resolve(path.join('..', pkg.name));

  //if the project doesn't exist, clone it from github
  if (!fsExtra.pathExistsSync(packageSrcPath)) {
    console.log(`Cloning '${pkg.name}' from github`);
    //clone the project
    childProcess.execSync(`git clone https://github.com/georgejecook/${pkg.name}`, {
      cwd: path.resolve('..'),
      stdio: 'inherit'
    });
    //if --pull was provided, fetch and pull latest for each repo
  } else if (argv.pull === true) {
    console.log(`'${pkg.name}' exists. Getting latest`);

    childProcess.execSync(`git fetch && git pull`, {
      cwd: packageSrcPath,
      stdio: 'inherit'
    });
  }

  //install all npm dependencies 
  console.log(`Installing npm packages for '${pkg.name}'`);
  try {
    childProcess.execSync(`npm install --only=dev`, {
      cwd: path.resolve('..', pkg.name),
      stdio: 'inherit'
    });
  } catch (e) {
    console.error(e);
  }

  console.log(`building '${pkg.name}'`);
  //build the project
  try {
    childProcess.execSync(`ropm install`, {
      cwd: path.resolve('..', pkg.name),
      stdio: 'inherit'
    });
    childProcess.execSync(`npm run build`, {
      cwd: path.resolve('..', pkg.name),
      stdio: 'inherit'
    });
  } catch (e) {
    console.error(e);
  }

  console.log(`deleting '${pkg.name}' from node_modules to prevent contention`);
  try {
    fsExtra.ensureDirSync(`node_modules/${pkg.name}`);
    fsExtra.removeSync(`node_modules/${pkg.name}`);
  } catch (e) {
    console.error(e);
  }

  console.log(`adding '../${pkg.name}' to package.json with prefix ${pkg.prefix}`);
  packageJson.dependencies[pkg.prefix] = `file:../${pkg.name}`;
}

console.log('sample app');
fsExtra.writeFileSync('package.json', JSON.stringify(packageJson, null, 4));
console.log('ropm install');
childProcess.execSync('npx ropm install', {
  stdio: 'inherit'
});

function printHeader(name) {
  var length = 80;
  let text = '\n';

  text += ''.padStart(length, '-') + '\n';

  let leftLen = Math.round((length / 2) - (name.length / 2));
  let rightLen = 80 - (name.length + leftLen);
  text += ''.padStart(leftLen, '-') + chalk.white(name) + ''.padStart(rightLen, '-') + '\n';

  text += ''.padStart(length, '-') + '\n';

  console.log(chalk.blue(text));
}