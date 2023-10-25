# GCP Secrets K8s demo

Demo repo for storing secrets in GCP secrets manager in one project and then using stack outputs and references to retrieve them and push them to a GKE cluster as a Kubernetes secret.

## Pre-requisites

Follow the instructions [here](https://www.pulumi.com/docs/clouds/gcp/get-started/begin/) for typescript to ensure you have everything installed and set up.

You will also need to clone this repo: `git clone https://github.com/pierskarsenbarg/gcp-secrets-k8s`

## Setup Instructions

### Secrets project

In this project we will set up and store a secret in GCP Secrets manager.

- `cd secrets-project`
- `npm i`
- `pulumi config set gcp:zone {zone of your choice}`
- `pulumi config set gcp:project {GCP project name}`
- `pulumi up`

Once the update has finished you can view the secret id by running: `pulumi stack output secretId`.

### Kubernetes project

In this project we will set up an empty GKE cluster with a secret where the value is taken from the secret manager we created in the other project.

- `cd k8s-project`
- `npm i`
- `pulumi config set gcp:zone {zone of your choice}`
- `pulumi config set gcp:project {GCP project name}`
- `pulumi up`

Once this has finished, you can go ahead and view the secret in the k8s cluster (using kubectl or similar)

## Tear down Instructions

Don't forget to delete your infrastructure when you're done:

- `cd k8s-project && pulumi destroy`
- `cd ../secrets-project && pulumi destroy`