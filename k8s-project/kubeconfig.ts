import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

export const buildKubeconfig = async (cluster: gcp.container.Cluster) : Promise<pulumi.Output<string>> => {
    const config = new pulumi.Config("gcp");
    const gcpProject = config.get("project");
    const gcpZone = config.get("zone");
    return pulumi
        .all([cluster.name, cluster.endpoint, cluster.masterAuth])
        .apply(([name, endpoint, masterAuth]) => {
            const context = `${gcpProject}_${gcpZone}_${name}`;
            return `
            apiVersion: v1
            clusters:
            - cluster:
                certificate-authority-data: ${masterAuth.clusterCaCertificate}
                server: https://${endpoint}
              name: ${context}
            contexts:
            - context:
                cluster: ${context}
                user: ${context}
              name: ${context}
            current-context: ${context}
            kind: Config
            preferences: {}
            users:
            - name: ${context}
              user:
                exec:
                  apiVersion: client.authentication.k8s.io/v1beta1
                  command: gke-gcloud-auth-plugin
                  installHint: Install gke-gcloud-auth-plugin for use with kubectl by following
                    https://cloud.google.com/blog/products/containers-kubernetes/kubectl-auth-changes-in-gke
                  provideClusterInfo: true
                  `;
        })
}

