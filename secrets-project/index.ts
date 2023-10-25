import * as gcp from "@pulumi/gcp";
import * as random from "@pulumi/random";

const secret = new gcp.secretmanager.Secret("secret", {
    replication: {
        auto: {}
    },
    secretId: "pk-secret"
})

const secretData = new random.RandomPassword("pw", {
    length: 20
})

const secretVersion = new gcp.secretmanager.SecretVersion("secretversion", {
    secret: secret.id,
    secretData: secretData.result
});

export const secretId = secret.id