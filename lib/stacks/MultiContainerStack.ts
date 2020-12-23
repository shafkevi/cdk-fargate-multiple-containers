import { Vpc } from "@aws-cdk/aws-ec2";
import { Construct, Stack, CfnOutput } from "@aws-cdk/core";
import Certificate from "../constructs/Certificate";
import Fargate from "../constructs/Fargate";
import LoadBalancer from "../constructs/LoadBalancer";
import { Protocol, } from "@aws-cdk/aws-ecs";
import { ApplicationProtocol, ListenerCondition, } from "@aws-cdk/aws-elasticloadbalancingv2";

export interface MultiContainerStackProps {
  domain?: string,
  certificateArn?: string,
}

export default class MultiContainer extends Stack {

  constructor(scope: Construct, id: string, props: MultiContainerStackProps) {
    super(scope, id);

    const {
      domain,
      certificateArn,
    } = props;

    const vpc = new Vpc(this, "Vpc", { maxAzs: 2});

    const { certificate } = new Certificate(this, "Certificate", {
      domain,
      certificateArn 
    });

    const fargate = new Fargate(this, 'App', {
      vpc,
      certificate
    });

    const loadBalancer = new LoadBalancer(this, 'LoadBalancer', {
      vpc,
      certificate,
    });

    loadBalancer.addTarget("ApiTarget", {
      port: 8080, // api port
      targets: [fargate.service]
    });

    loadBalancer.addTarget("AppTarget", {
      port: 8081, // app port
      protocol: ApplicationProtocol.HTTP,
      conditions: [
        ListenerCondition.pathPatterns(['/app/*'])
      ],
      priority: 1,
      targets: [fargate.service.loadBalancerTarget({
        containerName: 'AppContainer',
        containerPort: 8081,
        protocol: Protocol.TCP
      })]
    });

  }
}
