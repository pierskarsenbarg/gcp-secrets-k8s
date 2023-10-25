import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as k8s from "@pulumi/kubernetes";
import {buildKubeconfig} from "./kubeconfig";
import { StackReferenceOutputDetails } from "@pulumi/pulumi";

export = async () => {

    const stackreference = new pulumi.StackReference("pierskarsenbarg/secrets-project/dev");

    const secretId = await getValue<string>(await stackreference.getOutputDetails("secretId"), "");

    const gcpSecret = gcp.secretmanager.getSecretVersionOutput({
        secret: secretId
    });

    const cluster = new gcp.container.Cluster("pk-cluster", {
        initialNodeCount: 1,
        removeDefaultNodePool: true,

    });


    const kubeconfig = await buildKubeconfig(cluster);

    const provider = new k8s.Provider("provider", {
        kubeconfig: kubeconfig
    }, {dependsOn: cluster})

    const namespace = new k8s.core.v1.Namespace("secretsnamespace", {}, {provider, dependsOn: [cluster]});

    const secret = new k8s.core.v1.Secret("mysecret", {
        metadata: {
            namespace: namespace.metadata.name
        },
        stringData: {
            "mygcpsecret": gcpSecret.secretData
        }
    }, {provider: provider});

    return {
        kubeconfig: kubeconfig,
        namespace: namespace.metadata.name,
        secretname: secret.metadata.name
    }

}

function getValue<T>(input: StackReferenceOutputDetails, defaultValue: T): T {
    if (!input) {
        return defaultValue;
    }

    if (input.value) {
        return <T>input.value!;
    }

    if (input.secretValue) {
        return <T>input.secretValue!;
    }

    return defaultValue;
}