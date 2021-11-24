import * as core from '@actions/core';
import Compost from '@infracost/compost';
import fs from 'fs';
import {
  DetectResult,
  GetBehavior,
  PostBehavior,
  TargetType,
} from '@infracost/compost/dist/types';
import { GitHubOptions } from '@infracost/compost/dist/platforms/github';
import { stripMarkdownTag } from '@infracost/compost/dist/util';
import { GitHubActionsDetector } from '@infracost/compost/dist/detect/githubActions';
import { DetectError } from '@infracost/compost/dist/detect';

const validBehavior = [
  'update',
  'delete_and_new',
  'hide_and_new',
  'new',
  'latest',
];
const validTargetType = ['pr', 'commit'];

function loadBody(): string {
  const body = core.getInput('body');
  if (body) {
    return body;
  }

  const bodyFile = core.getInput('bodyFile');
  if (!bodyFile) {
    throw new Error('body or bodyFile is required');
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
    if (!validBehavior.includes(behavior)) {
      throw new Error(
        `Invalid behavior '${behavior}' must be one of: ${validBehavior.join(
          ', '
        )}`
      );
    }

    const tag = core.getInput('tag');

    const token = core.getInput('GITHUB_TOKEN', { required: true });

    const compost = new Compost({
      tag,
      token,
      logger,
    } as GitHubOptions);

    const inputTargetType = core.getInput('targetType') as TargetType;
    if (inputTargetType && !validTargetType.includes(inputTargetType)) {
      throw new Error(
        `Invalid targetType '${inputTargetType}' must be one of: ${validTargetType.join(
          ', '
        )}`
      );
    }

    process.env.GITHUB_TOKEN = token; // Need to set the environment variable because the detector requires it to detect github.
    const detector = new GitHubActionsDetector({
      targetTypes: inputTargetType ? [inputTargetType] : undefined,
      logger,
    });

    let result: DetectResult = null;
    try {
      result = detector.detect();
      logger.debug(
        `Detected {platform:'${result.platform}' project:'${result.project}' targetType:'${result.targetType}' targetRef:'${result.targetRef}'}`
      );
    } catch (err) {
      if (err instanceof Error && err.name === DetectError.name) {
        logger.debug(err.message);
      } else {
        throw err;
      }
    }

    const repo = core.getInput('repo') || result?.project;
    if (!repo) {
      throw new Error('repo could not be detected');
    }

    const targetType = inputTargetType || result?.targetType;
    if (!targetType) {
      throw new Error('targetType could not be detected');
    }

    const prNumber = core.getInput('prNumber');
    const commitSha = core.getInput('commitSha');
    const targetRef = prNumber || commitSha || result?.targetRef;
    if (!targetRef) {
      throw new Error('targetRef could not be detected');
    }

    if (behavior === 'latest') {
      const latestComment = await compost.getComment(
        'github',
        repo,
        targetType,
        targetRef,
        behavior as GetBehavior
      );
      if (latestComment) {
        core.setOutput('body', stripMarkdownTag(latestComment.body));
      }
    } else {
      const body = loadBody();
      await compost.postComment(
        'github',
        repo,
        targetType,
        targetRef,
        behavior as PostBehavior,
        body
      );
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
