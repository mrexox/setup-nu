/**
 * Author: hustcer
 * Created: 2022/04/28 18:50:20
 */

import shell from 'shelljs';
import * as core from '@actions/core';

import * as setup from './setup';

async function main() {
  try {
    const versionSpec = core.getInput('version');
    const checkLatest = (core.getInput('check-latest') || 'false').toUpperCase() === 'TRUE';
    const enablePlugins = (core.getInput('enable-plugins') || 'false').toUpperCase() === 'TRUE';
    const tool = await setup.checkOrInstallTool({
      versionSpec,
      checkLatest,
      enablePlugins,
      bin: 'nu',
      name: 'nushell',
      owner: 'nushell',
    });
    core.addPath(tool.dir);
    core.info(`Successfully setup ${tool.name} v${tool.version}`);

    if (enablePlugins) {
      console.log('Running ./nu/register-plugins.nu to register plugins...');
      shell.exec('nu ./nu/register-plugins.nu');
    }
    const modules = process.env.NU_MODULE_DIRS;
    if (modules) {
      // The exported variable might be override by the following steps.
      core.exportVariable('NU_LIB_DIRS', 'EXPORT-VAR-WILL-BE-OVERRIDDEN');
      core.exportVariable('NU_NOT_EXIST', 'EXPORT-NONE-EXIST-VAR-WORKS');
      shell.exec('nu ./nu/prepare.nu');
    }
  } catch (err) {
    core.setFailed(err.message);
  }
}

main();
