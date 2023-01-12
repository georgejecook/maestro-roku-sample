// eslint-disable-next-line
const path = require('path');
// eslint-disable-next-line
const ProgramBuilder = require('brighterscript').ProgramBuilder;
// eslint-disable-next-line
const DiagnosticSeverity = require('brighterscript').DiagnosticSeverity;
// eslint-disable-next-line
const pkg = require('../package');
// eslint-disable-next-line
const fs = require('fs-extra');
const envName = process.argv.slice(2)[0];
let projectPath = path.join(__dirname, '../', `bsconfig-${envName}.json`);
console.log(`building "${envName}" (${projectPath}`);
let configText = fs.readFileSync(projectPath, 'utf8');
let config = JSON.parse(configText);
config.robot = {
    version: pkg.version,
    env: envName
};
let programBuilder = new ProgramBuilder();
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
programBuilder.run(config).then(() => {
    //fail if there are diagnostics
    if (programBuilder.program.getDiagnostics().filter((x) => x.severity === DiagnosticSeverity.Error).length > 0) {
        throw new Error('Encountered error diagnostics');
    }
    else {
        console.log('\nBuild is finished');
    }
}).catch(e => {
    process.exit(1);
});
//# sourceMappingURL=run.js.map