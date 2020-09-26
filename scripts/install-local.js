/**
 * Installs a local version of all the rokucommunity dependent packages into this project
 */

var fs = require('fs-extra');
var path = require('path');
var childProcess = require('child_process');
var chalk = require('chalk');

// var argv = require('yargs').argv;

let packages = {
  'log': 'maestro-roku-log',
  'mc': 'maestro-roku-core',
  'mioc': 'maestro-roku-ioc',
  'mv': 'maestro-roku-view',
  'mx': 'maestro-roku-mvvm'
};

//set the cwd to the root of this project
let thisProjectRootPath = path.join(__dirname, '..');
process.chdir(thisProjectRootPath);
let packageJson = JSON.parse(fs.readFileSync('package.json').toString());

for (let pkgPrefix in packages) {
  const pkgName = packages[pkgPrefix]
  printHeader(pkgName);
  let packageSrcPath = path.resolve(path.join('..', pkgName));

  //if the project doesn't exist, clone it from github
  if (!fs.pathExistsSync(packageSrcPath)) {
    console.log(`Cloning '${pkgName}' from github`);
    //clone the project
    childProcess.execSync(`git clone https://github.com/georgejecook/${pkgName}`, {
      cwd: path.resolve('..'),
      stdio: 'inherit'
    });
  }

  //install all npm dependencies 
  const subPkgPackagePath = path.join('..', pkgName, 'package.json');
  console.log(`Updating project dependencies for '${pkgName}' in ${subPkgPackagePath}`);
  let subPackageJson = JSON.parse(fs.readFileSync(subPkgPackagePath).toString());
  for (let subPkgPrefix in subPackageJson.dependencies) {
    if (packages[subPkgPrefix]) {
      subPackageJson.dependencies[subPkgPrefix] = `file:../${packages[subPkgPrefix]}`;
    }
  }
  fs.writeFileSync(subPkgPackagePath, JSON.stringify(subPackageJson, null, 4));

  console.log(`adding '../${pkgName}' to package.json with pkgPrefix ${pkgPrefix}`);
  packageJson.dependencies[pkgPrefix] = `file:../${pkgName}`;

  console.log(`Installing npm packages for '${pkgName}'`);
  try {
    childProcess.execSync(`npm install --only=dev`, {
      cwd: path.resolve('..', pkgName),
      stdio: 'inherit'
    });
  } catch (e) {
    console.error(e);
  }

  console.log(`building '${pkgName}'`);
  //build the project
  try {
    childProcess.execSync(`ropm install`, {
      cwd: path.resolve('..', pkgName),
      stdio: 'inherit'
    });
    childProcess.execSync(`npm run build`, {
      cwd: path.resolve('..', pkgName),
      stdio: 'inherit'
    });
  } catch (e) {
    console.error(e);
  }

  console.log(`deleting '${pkgName}' from node_modules to prevent contention`);
  try {
    fs.ensureDirSync(`node_modules/${pkgName}`);
    fs.removeSync(`node_modules/${pkgName}`);
  } catch (e) {
    console.error(e);
  }

  console.log(`adding '../${pkgName}' to package.json with pkgPrefix ${pkgPrefix}`);
  packageJson.dependencies[pkgPrefix] = `file:../${pkgName}`;
}

console.log('sample app');
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 4));
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