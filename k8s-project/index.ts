import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as k8s from "@pulumi/kubernetes";
import {buildKubeconfig} from "./kubeconfig";
import { StackReferenceOutputDetails } from "@pulumi/pulumi";

export = async () => {

    const stackreference = new pulumi.StackReference("pierskarsenbarg/secrets-project/dev");

    const secretValue = await getValue<string>(await stackreference.getOutputDetails("secretValue"), "")

    const cluster = new gcp.container.Cluster("pk-cluster", {
        initialNodeCount: 1,
    });


    const kubeconfig = await buildKubeconfig(cluster);

    const provider = new k8s.Provider("provider", {
        kubeconfig: kubeconfig
    })

    const namespace = new k8s.core.v1.Namespace("secretsnamespace", {}, {provider});

    const secret = new k8s.core.v1.Secret("mysecret", {
        metadata: {
            namespace: namespace.metadata.name
        },
        stringData: {
            "mygcpsecret": secretValue
        }
    }, {provider: provider});

    return {
        kubeconfig
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