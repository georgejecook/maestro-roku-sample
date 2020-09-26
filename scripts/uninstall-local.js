var fs = require('fs-extra');
var path = require('path');
var childProcess = require('child_process');
var chalk = require('chalk');


let packages = {
  "log": "maestro-roku-log",
  "mc": "maestro-roku-core",
  "mioc": "maestro-roku-ioc",
  "mv": "maestro-roku-view"
};

let packageVersions = {
  "log": "npm:maestro-roku-log@^0.2.2",
  "mc": "npm:maestro-roku-core@^0.2.5",
  "mioc": "npm:maestro-roku-ioc@^0.2.5",
  "mv": "npm:maestro-roku-view@^0.2.14"
};

console.log('Resetting sub package imports');

for (let pkgPrefix in packages) {
  const pkgName = packages[pkgPrefix]
  printHeader(pkgName);
  const subPkgPackagePath = path.join('..', pkgName, 'package.json');
  console.log(`Updating project dependencies for '${pkgName}' in ${subPkgPackagePath}`);
  let subPackageJson = JSON.parse(fs.readFileSync(subPkgPackagePath).toString());
  for (let subPkgPrefix in subPackageJson.dependencies) {
    if (packages[subPkgPrefix]) {
      subPackageJson.dependencies[subPkgPrefix] = `${packageVersions[subPkgPrefix]}`;
    }
  }
  fs.writeFileSync(subPkgPackagePath, JSON.stringify(subPackageJson, null, 4));
}

console.log('Loading original package.json from git');
var currentPackageJson = JSON.parse(
  fs.readFileSync('package.json').toString()
);
var originalPackageJson = JSON.parse(
  childProcess.execSync('git --no-pager show HEAD:package.json')
);

for (let pkgPrefix in packages) {
  const pkgName = packages[pkgPrefix]
  console.log(`\n--------${pkgName}--------`);
  console.log(`Deleting 'roku_modules/${pkgName}'`);

  console.log('Restoring package.json dependency version');
  currentPackageJson.dependencies[pkgName] = originalPackageJson.dependencies[pkgName];
}

console.log(`\n--------vscode-brightscript-langauge--------`);
console.log('Saving package.json');
fs.writeFileSync('package.json', JSON.stringify(currentPackageJson, null, 4));
console.log('ropm install');
childProcess.execSync('ropm install', {
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
