import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const secret = new gcp.secretmanager.Secret("secret", {
    replication: {
        auto: {}
    },
    secretId: "pk-secret"
})

const secretVersion = new gcp.secretmanager.SecretVersion("secretversion", {
    secret: secret.id,
    secretData: "mysecret"
});

export const secretValue = secretVersion.secretData;