# Infracost Compost Action

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
        uses: infracost/compost@master
        with: 
          body: "This is a compost comment!"
```

## Inputs

The action supports the following inputs:

- `behavior`: Optional, defaults to `update`.  The behavior to use when posting comments.  Must be one of `update` | `delete_and_new` | `hide_and_new` | `new` | `latest`.   

- `body`: Specify the comment body content.

- `bodyFile`: Optional.  Specify a path to a file containing the comment body.  Mutually exclusive with body.

- `tag`: Optional.  Customize the comment tag. This is added to the comment as a markdown comment to detect the previously posted comments.

- `targetType`: Optional, defaults to `pr`.  What object should be commented on.  Must be `pr` or `commit`.  When `commit`, the `behavior` option will be ignored.

- `repository`: Optional, defaults to `${{ github.repository }}`.  The GitHub owner and repository name. For example, 'infracost/compost-action'.

- `pullRequestNumber`: Optional, defaults to the pull request number of the current event.

- `GITHUB_TOKEN`: Optional, default to `${{ github.token }}`.

## Outputs

- `latest`: The body of the latest existing comment when using behavior 'latest'.
