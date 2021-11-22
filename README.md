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
        uses: infracost/compost-action@master
        with: 
          body: "This is a compost comment!"
```

## Inputs

The action supports the following inputs:

- `behavior`: Optional, defaults to `update`.  The behavior to use when posting comments.  Must be one of `update` | `delete_and_new` | `hide_and_new` | `new` | `latest`.   

- `body`: Specify the comment body content.

- `bodyFile`: Optional.  Specify a path to a file containing the comment body.  Mutually exclusive with body.

- `tag`: Optional.  Customize the comment tag. This is added to the comment as a markdown comment to detect the previously posted comments.

- `repo`: Optional, defaults to the `GITHUB_REPOSITORY` env.  The GitHub owner and repository name. For example, 'infracost/compost-action'.

- `targetType`: Optional.  Which objects should be commented on.  May be `pr` or `commit`.

- `prNumber`: Optional, defaults to the pull request of the current event. The number of the pull request to be commented on.

- `GITHUB_TOKEN`: Optional, default to `${{ github.token }}`.

## Outputs

- `latest`: The body of the latest existing comment when using behavior 'latest'.
