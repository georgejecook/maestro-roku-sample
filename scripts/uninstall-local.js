var fs = require('fs-extra');
var childProcess = require('child_process');

let packages = [
  'maestro-roku-log',
  'maestro-roku-core',
  'maestro-roku-ioc',
  'maestro-roku-view',
  'maestro-roku-mvvm',
];

console.log('Loading original package.json from git');
var currentPackageJson = JSON.parse(
  fs.readFileSync('package.json').toString()
);
var originalPackageJson = JSON.parse(
  childProcess.execSync('git --no-pager show HEAD:package.json')
);

for (let packageName of packages) {
  console.log(`\n--------${packageName}--------`);
  console.log(`Deleting 'roku_modules/${packageName}'`);

  console.log('Restoring package.json dependency version');
  currentPackageJson.dependencies[packageName] = originalPackageJson.dependencies[packageName];
}

console.log(`\n--------vscode-brightscript-langauge--------`);
console.log('Saving package.json');
fs.writeFileSync('package.json', JSON.stringify(currentPackageJson, null, 4));
console.log('ropm install');
childProcess.execSync('ropm install', {
  stdio: 'inherit'
});