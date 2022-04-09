# Infracost Compost Action


## Deprecation notice

⚠️ This repo is now deprecated. We have moved this functionality into the Infracost CLI via the `infracost comment` subcommand. See [the infracost comment docs](https://www.infracost.io/docs/features/cli_commands/#comment-on-pull-requests) for usage. ⚠️

---

Post pull request comments from multiple CI platforms.

This GitHub Action posts a GitHub comment to a commit or pull request.

## Usage

```yaml
on: [pull_request]
jobs:
  compost:
    runs-on: ubuntu-latest
    name: Post comment
    steps:
      - name: Comment
        uses: infracost/compost-action@master
        with: 
          body: "This is a compost comment!"
```

## Inputs

The action supports the following inputs:

- `behavior`: Optional, defaults to `update`. The behavior to use when posting cost estimate comments. Must be one of the following:  
  - `update`: Create a single comment and update it on changes. This is the "quietest" option. The GitHub comments UI shows what/when changed when the comment is updated. Pull request followers will only be notified on the comment create (not updates), and the comment will stay at the same location in the comment history.
  - `delete-and-new`: Delete previous cost estimate comments and create a new one. Pull request followers will be notified on each comment.
  - `hide-and-new`: Minimize previous cost estimate comments and create a new one. Pull request followers will be notified on each comment.
  - `new`: Create a new cost estimate comment. Pull request followers will be notified on each comment.

- `body`: Specify the comment body content.

- `body-file`: Optional. Specify a path to a file containing the comment body. Mutually exclusive with body.

- `tag`: Optional. Customize the comment tag. This is added to the comment as a markdown comment to detect the previously posted comments.

- `target-type`: Optional. Which objects should be commented on. May be `pull-request` or `commit`.

- `github-token`: Optional, default to `${{ github.token }}`.

## Outputs

- `body`: The body of the comment. This is the latest existing comment when using behavior 'latest', and the comment that was posted otherwise.
