import * as core from '@actions/core';
import compost, { GetBehavior, PostBehavior, TargetType } from '@infracost/compost';
import fs from 'fs';

const validBehaviors = [
  'update',
  'delete-and-new',
  'hide-and-new',
  'new',
  'latest',
];
const validTargetTypes = ['pull-request', 'commit'];

function loadBody(): string {
  const body = core.getInput('body');
  if (body) {
    return body;
  }

  const bodyFile = core.getInput('body-file');
  if (!bodyFile) {
    throw new Error('body or body-file is required');
  }

  if (!fs.existsSync(bodyFile)) {
    throw new Error(`body-file ${bodyFile} does not exist`);
  }

  try {
    return fs.readFileSync(bodyFile, 'utf8');
  } catch (err) {
    throw new Error(`Error reading body-file: ${err as string}`);
  }
}

async function comment(): Promise<void> {
  try {
    const logger = { debug: core.debug, warn: core.warning, info: core.info };

    const behavior = core.getInput('behavior', { required: true });
    if (!validBehaviors.includes(behavior)) {
      throw new Error(
        `Invalid behavior '${behavior}' must be one of: ${validBehaviors.join(
          ', '
        )}`
      );
    }

    const targetType = core.getInput('target-type');
    if (targetType && !validTargetTypes.includes(targetType)) {
      throw new Error(
        `Invalid target-type '${targetType}' must be one of: ${validTargetTypes.join(
          ', '
        )}`
      );
    }

    const tag = core.getInput('tag');

    // Need to set the environment variable because the detector requires it to detect github.
    process.env.GITHUB_TOKEN = core.getInput('github-token', {
      required: true,
    });

    const c = compost.autodetect({
      platform: 'github',
      targetType: targetType ? (targetType as TargetType) : undefined,
      tag,
      logger,
    });

    if (!c) {
      throw new Error('GitHub could not be detected');
    }

    if (behavior === 'latest') {
      const latestComment = await c.getComment(behavior as GetBehavior);
      if (latestComment) {
        core.setOutput('body', latestComment.body);
      }
    } else {
      const body = loadBody();
      await c.postComment(behavior as PostBehavior, body);
      core.setOutput('body', body);
    }
  } catch (e) {
    core.setFailed(e as string | Error);
  }
}

if (require.main === module) {
  // eslint-disable-next-line no-void
  void comment();
}
