import * as core from '@actions/core';
import * as github from '@actions/github';
import Compost from '@infracost/compost';
import fs from 'fs';
import { GetBehavior, PostBehavior } from '@infracost/compost/dist/types';
import { GitHubOptions } from '@infracost/compost/dist/platforms/github';

const validBehavior = [
  'update',
  'delete_and_new',
  'hide_and_new',
  'new',
  'latest',
];
const validTargetType = ['pr', 'comment'];

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
    const behavior = core.getInput('behavior', { required: true });
    if (!validBehavior.includes(behavior)) {
      throw new Error(
        `Invalid behavior '${behavior}' must be one of: ${validBehavior.join(
          ', '
        )}`
      );
    }

    const targetType = core.getInput('targetType', { required: true });
    if (!validTargetType.includes(targetType)) {
      throw new Error(
        `Invalid targetType '${targetType}' must be one of: ${validTargetType.join(
          ', '
        )}`
      );
    }

    const tag = core.getInput('tag');

    const repository =
      core.getInput('repository') || process.env.GITHUB_REPOSITORY;
    if (!repository) {
      throw new Error('repository is required');
    }

    const token = core.getInput('GITHUB_TOKEN', { required: true });

    const compost = new Compost({
      tag,
      token,
      logger: { debug: core.debug, warn: core.warning, info: core.info },
    } as GitHubOptions);

    let targetRef: string | number | undefined;
    if (targetType === 'pr') {
      targetRef =
        core.getInput('pullRequestNumber') ||
        github.context?.payload?.pull_request?.number;
    } else if (targetType === 'commit') {
      targetRef = process.env.GITHUB_SHA;
    } else {
      throw new Error('targetType is required');
    }

    if (!targetRef) {
      throw new Error(`No target found for targetType '${targetType}'`);
    }

    if (behavior === 'latest') {
      const latestComment = await compost.getComment(
        'github',
        repository,
        targetType,
        targetRef,
        behavior as GetBehavior
      );
      if (latestComment) {
        core.setOutput('latest', latestComment.body);
      }
    } else {
      const body = loadBody();
      await compost.postComment(
        'github',
        repository,
        targetType,
        targetRef,
        behavior as PostBehavior,
        body
      );
    }
  } catch (e) {
    core.setFailed(e as string | Error);
  }
}

if (require.main === module) {
  // eslint-disable-next-line no-void
  void comment();
}
