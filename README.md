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

- `behavior`: Optional, defaults to `update`. The behavior to use when posting comments. Must be one of `update` | `delete-and-new` | `hide-and-new` | `new` | `latest`.  

- `body`: Specify the comment body content.

- `body-file`: Optional. Specify a path to a file containing the comment body. Mutually exclusive with body.

- `tag`: Optional. Customize the comment tag. This is added to the comment as a markdown comment to detect the previously posted comments.

- `target-type`: Optional. Which objects should be commented on. May be `pr` or `commit`.

- `github-token`: Optional, default to `${{ github.token }}`.

## Outputs

- `body`: The body of the comment. This is the latest existing comment when using behavior 'latest', and the comment that was posted otherwise.
